import { store, generateId } from '../data/store.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const post = store.posts.get(id);
    if (!post) {
      return sendResponse(res, 404, createErrorResponse('Post not found'));
    }

    const comment = {
      id: generateId(),
      postId: id,
      authorId: userId,
      content,
      createdAt: new Date().toISOString()
    };

    store.comments.set(comment.id, comment);

    // Update post comment count
    post.commentsCount += 1;
    store.posts.set(id, post);

    // Get author info for response
    const author = store.users.get(userId);
    const commentWithAuthor = {
      ...comment,
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username,
        avatarUrl: author.avatarUrl
      } : null
    };

    sendResponse(res, 201, createSuccessResponse(commentWithAuthor, 'Comment created successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to create comment'));
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    const post = store.posts.get(id);
    if (!post) {
      return sendResponse(res, 404, createErrorResponse('Post not found'));
    }

    let comments = Array.from(store.comments.values()).filter(
      comment => comment.postId === id
    );

    // Sort by newest first
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = comments.length;
    const paginatedComments = comments.slice(offset, offset + limit);

    // Add author info
    const commentsWithAuthors = paginatedComments.map(comment => {
      const author = store.users.get(comment.authorId);
      
      return {
        ...comment,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(commentsWithAuthors, 'Comments retrieved successfully', {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to retrieve comments'));
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = store.comments.get(commentId);
    if (!comment) {
      return sendResponse(res, 404, createErrorResponse('Comment not found'));
    }

    // Check if user is the author
    if (comment.authorId !== userId) {
      return sendResponse(res, 403, createErrorResponse('Can only delete your own comments'));
    }

    // Delete comment
    store.comments.delete(commentId);

    // Update post comment count
    const post = store.posts.get(comment.postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
      store.posts.set(post.id, post);
    }

    sendResponse(res, 200, createSuccessResponse(null, 'Comment deleted successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to delete comment'));
  }
};
