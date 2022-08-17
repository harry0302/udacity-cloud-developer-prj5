import 'source-map-support/register'
import { Article } from '../models/article'
import { ArticleRepository } from '../dataLayer/article'
import { createLogger } from '../utils/logger'
import { CreateArticleRequest } from '../request/createArticleRequest'
import { UpdateArticleRequest } from '../request/updateArticleRequest'
import { ErrorREST } from '../utils/error'
import { S3Storage } from '../dataLayer/s3Storage'
import { HttpStatusCode } from '../constants/httpStatusCode'
import slugify from 'slugify';

const logger = createLogger('ArticlesService')

const articleRepo = new ArticleRepository()
const storage = new S3Storage()

interface getArticlesInput {
    tag: string
    author: string
    favorited: string
    userId: string
    limit: number
    offset: number
}

export async function getArticles(input: getArticlesInput): Promise<Article[]> {
    logger.info("Retrieving all articles");
    const items = await articleRepo.findAll(input);

    return items
}

export async function getArticleBySlug(slug: string): Promise<Article> {
    logger.info(`Retrieving article ${slug}`);

    const item = await articleRepo.findBySlug(slug);

    return item
}

export function generateUploadUrl(filename: string): string {
    logger.info(`Starting generateUploadUrl for ${filename}`);

    return storage.getPutSignedUrl(filename);
}

export async function createArticle(userId: string, request: CreateArticleRequest): Promise<Article> {
    const now = (new Date()).getTime();
    const slug = slugify(request.title) + '-' +
        (Math.random() * Math.pow(36, 6) | 0).toString(36);

    const newItem: Article = {
        slug: slug,
        author: userId,
        createdAt: now,
        updatedAt: now,
        ...request,
    };

    logger.info(`Creating Article ${slug} for user ${userId}`, { userId, slug, article: newItem });

    await articleRepo.create(newItem);

    return newItem;
}

export async function updateArticle(userId: string, slug: string, request: UpdateArticleRequest): Promise<void> {

    logger.info(`Updating article ${slug} for user ${userId}`, { userId, slug, article: request });

    const item = await getArticleBySlug(slug);

    if (!item) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (item.author !== userId) {
        logger.error(`User ${userId} does not have permission to update article ${slug}`);
        throw new ErrorREST(HttpStatusCode.Forbidden, 'User is not authorized to update item');
    }

    await articleRepo.update({
        slug: slug,
        ...request
    } as Article);
}

export async function deleteArticle(userId: string, slug: string) {
    logger.info(`Deleting todo ${slug} for user ${userId}`, { slug, userId });

    const item = await getArticleBySlug(slug);

    if (!item) {
        logger.error(`Article ${slug} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (item.author !== userId) {
        logger.error(`User ${userId} does not have permission to delete article ${slug}`);
        throw new ErrorREST(HttpStatusCode.Forbidden, 'User is not authorized to update item');
    }

    await articleRepo.delete(slug);
}

export async function getAllTags(): Promise<string[]> {
    logger.info("Retrieving all tag");
    const items = await articleRepo.findTags();

    return items
}

