export enum Types {
    PAGE = 'page',
    TEXT = 'text',
    BULLETED_LIST = 'bulleted_list',
    NUMBERED_LIST = 'numbered_list',
    HEADER = 'header',
    SUB_HEADER = 'sub_header',
    SUB_SUB_HEADER = 'sub_sub_header',
    QUOTE = 'quote',
    TO_DO = 'to_do',
    DIVIDER = 'divider',
    COLUMN_LIST = 'column_list',
    COLUMN = 'column',
    CALLOUT = 'callout',
    IMAGE = 'image',
    EMBED = 'embed',
    VIDEO = 'video',
    CODE = 'code',
    TABLE = 'collection_view',
}

export interface TableRow {
    [key: string]: {
        value: string | null
        type: string | null
    }
}

export interface BaseValueType {
    id: string
    version: number
    created_time: number
    last_edited_time: number
    parent_id: string
    parent_table: string
    alive: boolean
    created_by_table: string
    created_by_id: string
    last_edited_by_table: string
    last_edited_by_id: string
    content?: string[]
}

interface BaseTextValueType extends BaseValueType {
    properties?: {
        title: DecorationType
    }
    format?: {
        block_color: string
    }
}

interface BaseContentValueType extends BaseValueType {
    properties: {
        source: string[][]
        caption?: DecorationType[]
    }
    format: {
        block_width: number
        block_height: number
        display_source: string
        block_full_width: boolean
        block_page_width: boolean
        block_aspect_ratio: number
        block_preserve_scale: boolean
    }
    file_ids?: string[]
}

type DecorationType = [string] | [string, string[]]

interface PageValueType extends BaseValueType {
    type: Types.PAGE
    properties?: {
        title: DecorationType
    }
    format: {
        page_full_width?: boolean
        page_small_text?: boolean
        page_cover_position?: number
        block_locked?: boolean
        block_locked_by?: string
        page_cover?: string
        page_icon?: string
    }
    permissions: { role: string; type: string }[]
    file_ids?: string[]
}

interface TextValueType extends BaseTextValueType {
    type: Types.TEXT
}

interface BulletedListValueType extends BaseTextValueType {
    type: Types.BULLETED_LIST
}

interface NumberedListValueType extends BaseTextValueType {
    type: Types.NUMBERED_LIST
}

interface HeaderValueType extends BaseTextValueType {
    type: Types.HEADER
}

interface SubHeaderValueType extends BaseTextValueType {
    type: Types.SUB_HEADER
}

interface SubSubHeaderValueType extends BaseTextValueType {
    type: Types.SUB_SUB_HEADER
}

interface QuoteValueType extends BaseTextValueType {
    type: Types.QUOTE
}

interface TodoValueType extends BaseTextValueType {
    type: Types.TO_DO
    properties: {
        title: DecorationType
        checked: (['Yes'] | ['No'])[]
    }
}

interface DividerValueType extends BaseValueType {
    type: Types.DIVIDER
}

interface ColumnListValueType extends BaseValueType {
    type: Types.COLUMN_LIST
}

interface ColumnValueType extends BaseValueType {
    type: Types.COLUMN
    format: {
        column_ratio: number
    }
}

interface CalloutValueType extends BaseValueType {
    type: Types.CALLOUT
    format: {
        page_icon: string
        block_color: string
    }
    properties: {
        title: DecorationType[]
    }
}

interface ImageValueType extends BaseContentValueType {
    type: Types.IMAGE
}

interface EmbedValueType extends BaseContentValueType {
    type: Types.EMBED
}

interface VideoValueType extends BaseContentValueType {
    type: Types.VIDEO
}

interface CodeValueType extends BaseValueType {
    type: Types.CODE
    properties: {
        title: DecorationType[]
        language: DecorationType[]
    }
}

export interface CollectionView extends BaseValueType {
    type: Types.TABLE
    collection_id: string
    view_ids: string[]
    properties: { [key: string]: [[string]] }
    table?: TableRow[]
}

export type BlockValueType =
    | PageValueType
    | TextValueType
    | BulletedListValueType
    | NumberedListValueType
    | HeaderValueType
    | SubHeaderValueType
    | SubSubHeaderValueType
    | QuoteValueType
    | TodoValueType
    | DividerValueType
    | ColumnListValueType
    | ColumnValueType
    | CalloutValueType
    | ImageValueType
    | EmbedValueType
    | VideoValueType
    | CodeValueType
    | CollectionView

export interface Block {
    role: string
    value: BlockValueType
}
