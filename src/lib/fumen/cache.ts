import { Field } from './field';
import { EncodePage, Move, Page, PreCommand } from './types';
import { generateKey } from '../random';
import { isMinoPiece } from '../enums';

interface CachePage {
    field: {
        obj: Field;
        ref?: number;
    };
    piece?: Move;
    comment: {
        text: string;
        ref?: number;
    };
    commands?: {
        pre: {
            [key in string]: PreCommand;
        };
    };
    flags: {
        lock: boolean;
        mirror: boolean;
        colorize: boolean;
        rise: boolean;
        quiz: boolean;
    };
}

interface HashCachePage {
    page: CachePage;
    hash: string;
}

export class CachePages {
    private cache: HashCachePage[] = [];

    constructor(pages: Page[]) {
        const hash = generateKey();

        let field = new Field({});
        let comment = '';
        for (const page of pages) {
            if (page.field.obj !== undefined) {
                field = page.field.obj.copy();
            }

            if (page.comment.text !== undefined) {
                comment = page.comment.text;
            }

            const p2: CachePage = {
                field: {
                    obj: field.copy(),
                    ref: page.field.ref,
                },
                piece: page.piece,
                comment: {
                    text: comment,
                    ref: page.comment.ref,
                },
                commands: page.commands !== undefined ? {
                    ...page.commands,
                } : undefined,
                flags: { ...page.flags },
            };

            // 地形の更新
            if (page.flags.lock) {
                if (page.piece !== undefined && isMinoPiece(page.piece.type)) {
                    field.put(page.piece);
                }

                field.clearLine();

                if (page.flags.rise) {
                    field.up();
                }

                if (page.flags.mirror) {
                    field.mirror();
                }
            }

            this.cache.push({ hash, page: p2 });
        }
        console.log(this.cache);
    }

    get encode() {
        const pages: EncodePage[] = [];
        for (const cache of this.cache) {
            const page = cache.page;
            pages.push({
                field: page.field.obj,
                comment: page.comment.text,
                piece: page.piece,
                flags: page.flags,
            });
        }
        return pages;
    }
}
