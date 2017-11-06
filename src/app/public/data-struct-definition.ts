export interface Article {
    article_id: string;
    article_content: string;
    article_title: string;
    article_create_time: number;
    article_user_name: string;
}
export interface ArticleData {
    article_id: string;
    user_id: string;
    title: string;
    author_id: string;
    category_id: string;
    category_name: string;
    content: string;
    author: string;
    update_time: number;
    create_time: number;
    publish_status: number;
}

export interface Category {
    category_id: string;
    category_name?: string;
    category_type?: string;
    user_id?: string;
}

export interface Account {
    user_id: string;
    user_name: string;
}
