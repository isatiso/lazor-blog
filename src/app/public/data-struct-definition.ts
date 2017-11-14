export interface Article {
    article_id: string;
    article_content: string;
    article_title: string;
    article_create_time: number;
    article_user_name: string;
}
export class ArticleData {
    article_id: string;
    user_id: string;
    category_id: string;
    category_name: string;
    category_type: number;
    publish_status: number;
    title: string;
    content: string;
    author: string;
    email: string;
    update_time: number;
    create_time: number;

    constructor(article: object) {
        this.article_id = article['article_id'] || '';
        this.user_id = article['user_id'] || '';
        this.category_id = article['category_id'] || '';
        this.category_name = article['category_name'] || '';
        this.category_type = article['category_type'] || '';
        this.publish_status = article['publish_status'] || 0;
        this.title = article['title'] || 'Untitled';
        this.content = article['content'] || '';
        this.author = article['author'] || '';
        this.email = article['email'];
        this.update_time = article['update_time'] || 0;
        this.create_time = article['create_time'] || 0;

    }
}

export class Category {
    category_id: string;
    category_name?: string;
    category_type?: number;
    category_order?: number;
    show_options?: number;
    user_id?: string;

    constructor(category?: object) {
        this.category_id = category['category_id'] || '';
        this.category_name = category['category_name'] || '';
        this.category_type = category['category_type'] || 0;
        this.category_order = category['category_order'] || 0;
        this.show_options = category['show_options'] || 0;
        this.user_id = category['user_id'] || '';
    }
}

export interface Account {
    user_id: string;
    user_name: string;
}

export class Options {

    flush: boolean;
    article_id: string;

    constructor(options: object) {
        this.flush = options['flush'] || false;
        this.article_id = options['article_id'] || '';
    }
}
