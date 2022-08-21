import { Comment } from "../models/comment";
import { CommentRepository } from "../repository/comment";
import { CreateCommentRequest } from "../request/createCommentRequest";
import { createLogger } from "../utils/logger";
import * as UserService from './user';
import { v4 as uuidv4 } from 'uuid';
import { ErrorREST } from "../utils/error";
import { HttpStatusCode } from "../constants/httpStatusCode";

const logger = createLogger('CommentsService');

const commentRepo = new CommentRepository();

interface CommentWithAuthorInfo {
    id: string
    slug: string
    author: {
        username: string
        bio: string
        image: string
        following: boolean
    }
    body: string
    createdAt: string
}

export async function getCommentsBySlug(currentUserId: string, slug: string): Promise<CommentWithAuthorInfo[]> {
    logger.info("Retrieving all comment by slug", {slug});
    const items = await commentRepo.findBySlug(slug);

    const cmtPromises = [];

    items.forEach(a => cmtPromises.push(mapCommentWithAuthorInfo(a, currentUserId)));

    const comments = await Promise.all(cmtPromises);

    return comments;
}

export async function createComment(request: CreateCommentRequest): Promise<CommentWithAuthorInfo> {
    logger.info(`Creating comment`, {comment:request});

    const newItem: Comment = {
        commentId: uuidv4(),
        slug: request.slug,
        author: request.author,
        createdAt: new Date().toUTCString(),
        body: request.body,
    };

    await commentRepo.create(newItem);

    return await mapCommentWithAuthorInfo(newItem);
}

export async function deleteComment(currentUser: string, commentId: string): Promise<void> {
    logger.info(`Deleting comment ${commentId} by user ${currentUser}`, { commentId, currentUser });

    const item = await commentRepo.findById(commentId);

    if (!item) {
        logger.error(`Comment ${commentId} not found`);
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
    }

    if (item.author !== currentUser) {
        logger.error(`User ${currentUser} does not have permission to delete comment ${commentId}`);
        throw new ErrorREST(HttpStatusCode.Forbidden, 'User is not authorized to delete item');
    }

    await commentRepo.delete(commentId);
}

async function mapCommentWithAuthorInfo(cmt: Comment, currentUser?: string): Promise<CommentWithAuthorInfo> {
    const user = await UserService.getUserByUsername(cmt.author, currentUser);
    return {
        id: cmt.commentId,
        slug: cmt.slug,
        author: {
            username: user.username,
            bio: user.bio || '',
            image: user.image || '',
            following: user.isFollowing,
        },
        createdAt: cmt.createdAt,
        body: cmt.body,
    };
}

