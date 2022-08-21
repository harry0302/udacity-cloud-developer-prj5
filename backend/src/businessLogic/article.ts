import 'source-map-support/register';
import { Article } from '../models/article';
import { ArticleRepository } from '../dataLayer/article';
import { createLogger } from '../utils/logger';
import { CreateArticleRequest } from '../request/createArticleRequest';
import { UpdateArticleRequest } from '../request/updateArticleRequest';
import { ErrorREST } from '../utils/error';
import { HttpStatusCode } from '../constants/httpStatusCode';
import slugify from 'slugify';
import * as TagService from './tag';
import * as UserService from './user';
import { getGetSignedUrl } from '../utils/s3Helper';

const logger = createLogger('ArticlesService');

const articleRepo = new ArticleRepository();

interface getArticlesInput {
    tag: string
    author: string
    favorited: string
    currentUser: string
}

export interface ArticleWithAuthorInfo {
    slug: string
    title: string
    description: string
    body: string
    author: {
        username: string
        bio: string
        image: string
        following: boolean
    }
    tagList?: string[]
    createdAt?: number
    updatedAt?: number
    favorited: boolean
    favoritesCount: number
    hasImage: boolean
    image?: string
}

export async function getArticles(input: getArticlesInput): Promise<ArticleWithAuthorInfo[]> {
    logger.info("Retrieving all articles");

    const items = await articleRepo.findAll(input);

    const articlePromises = [];

    items.forEach(a => articlePromises.push(mapArticleWithAuthorInfo(a, input.currentUser)));

    const articles = await Promise.all(articlePromises);
    return articles;
}

export async function getArticlesFeed(currentUser: string): Promise<ArticleWithAuthorInfo[]> {
    logger.info(`Retrieving all articles feed by user ${currentUser}`);

    const items = await articleRepo.findByAuthor(currentUser);

    const articlePromises = [];

    items.forEach(a => articlePromises.push(mapArticleWithAuthorInfo(a, currentUser)));

    const articles = await Promise.all(articlePromises);
    return articles;
}

export async function existsArticleBySlug(slug: string): Promise<boolean> {
    logger.info(`Checking exist article ${slug}`);

    const item = await articleRepo.findBySlug(slug);

    if (!item) {
        return false;
    }

    return true;
}

export async function getArticleBySlug(slug: string, currentUser?: string): Promise<ArticleWithAuthorInfo> {
    logger.info(`Retrieving article ${slug}`);

    const item = await articleRepo.findBySlug(slug);

    if (!item) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    return await mapArticleWithAuthorInfo(item, currentUser);
}

export async function createArticle(currentUser: string, request: CreateArticleRequest): Promise<ArticleWithAuthorInfo> {
    const now = (new Date()).getTime();
    const slug = slugify(request.title) + '-' +
        (Math.random() * Math.pow(36, 6) | 0).toString(36);

    const newItem: Article = {
        slug: slug,
        author: currentUser,
        createdAt: now,
        updatedAt: now,
        body: request.body,
        description: request.description,
        title: request.title,
        tagList: request.tagList,
        favoritedBy: [],
        favoritesCount: 0,
        dummy: 'OK',
        hasImage: request.hasImage,
    };

    logger.info(`Creating article ${slug} for user ${currentUser}`, { username: currentUser, slug, article: newItem });

    await articleRepo.create(newItem);

    for (let index = 0; index < request.tagList.length; index++) {
        const tagName = request.tagList[index];
        await TagService.createTag({
            tagName: tagName,
        })
    }

    return await mapArticleWithAuthorInfo(newItem, currentUser);
}

export async function updateArticle(currentUser: string, slug: string, request: UpdateArticleRequest): Promise<ArticleWithAuthorInfo> {

    logger.info(`Updating article ${slug} for user ${currentUser}`, { username: currentUser, slug, article: request });

    const item = await articleRepo.findBySlug(slug);

    if (!item) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (item.author !== currentUser) {
        logger.error(`User ${currentUser} does not have permission to update article ${slug}`);
        throw new ErrorREST(HttpStatusCode.Forbidden, 'User is not authorized to update item');
    }

    const isUpdateTagList = JSON.stringify(item.tagList) !== JSON.stringify(request.tagList);

    item.title = request.title;
    item.body = request.body;
    item.description = request.description;
    item.updatedAt = (new Date()).getTime();
    item.tagList = request.tagList || [];
    item.hasImage = request.hasImage;

    await articleRepo.update(item);

    if (isUpdateTagList) {
        for (let index = 0; index < item.tagList.length; index++) {
            const tagName = item.tagList[index];
            await TagService.createTag({
                tagName: tagName,
            })
        }
    }

    return await mapArticleWithAuthorInfo(item, currentUser);
}

export async function deleteArticle(currentUser: string, slug: string): Promise<void> {
    logger.info(`Deleting article ${slug} for user ${currentUser}`, { slug, username: currentUser });

    const item = await articleRepo.findBySlug(slug);

    if (!item) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (item.author !== currentUser) {
        logger.error(`User ${currentUser} does not have permission to delete article ${slug}`);
        throw new ErrorREST(HttpStatusCode.Forbidden, 'User is not authorized to delete item');
    }

    await articleRepo.delete(slug);
}

export async function favoriteArticle(currentUser: string, slug: string): Promise<ArticleWithAuthorInfo> {
    logger.info(`Favorite article ${slug} for user ${currentUser}`, { slug, username: currentUser });

    const article = await articleRepo.findBySlug(slug);

    if (!article) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (!article.favoritedBy) {
        article.favoritedBy = [];
    }

    article.favoritedBy.push(currentUser);
    article.favoritesCount = article.favoritedBy ? article.favoritedBy.length : 0;

    await articleRepo.update(article);

    return await mapArticleWithAuthorInfo(article, currentUser);
}

export async function unfavoriteArticle(currentUser: string, slug: string): Promise<ArticleWithAuthorInfo> {
    logger.info(`Unfavorite article ${slug} for user ${currentUser}`, { slug, username: currentUser });

    const article = await articleRepo.findBySlug(slug);

    if (!article) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (!article.favoritedBy) {
        article.favoritedBy = [];
    }

    article.favoritedBy = article.favoritedBy.filter(
        e => (e !== currentUser));

    article.favoritesCount = article.favoritedBy.length;

    await articleRepo.update(article);

    return await mapArticleWithAuthorInfo(article, currentUser);
}

async function mapArticleWithAuthorInfo(article: Article, currentUser?: string): Promise<ArticleWithAuthorInfo> {
    const user = await UserService.getUserByUsername(article.author, currentUser);

    var res: ArticleWithAuthorInfo = {
        slug: article.slug,
        author: {
            username: user.username,
            bio: user.bio || '',
            image: user.image || '',
            following: user.isFollowing,
        },
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        body: article.body,
        description: article.description,
        title: article.title,
        tagList: article.tagList,
        favorited: false,
        hasImage: article.hasImage,
        favoritesCount: article.favoritesCount,
    };

    if (article.hasImage) {
        res.image = getGetSignedUrl(res.slug);
    }

    if (article.favoritedBy && currentUser) {
        res.favorited = article.favoritedBy
            .includes(currentUser);
    }

    return res;
}
