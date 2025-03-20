import { http } from "../base";
import { Query, Records, CommentType } from "@kysion/types";

export class Comment {
  public static fetchCommentList(query: Query) {
    return http.post<Records<CommentType>>('/comment/queryComment', query);
  }

  public static createComment(data: CommentType) {
    return http.post<CommentType>('/comment/createComment', data);
  }

  public static updateComment(data: CommentType) {
    return http.post<CommentType>('/comment/updateComment', data);
  }

  public static deleteComment(data: { id: string | number }) {
    return http.post<boolean>('/comment/deleteComment', data);
  }

  public static getCommentById(data: { id: string | number }) {
    return http.post<CommentType>('/comment/getCommentById', data);
  }
}
