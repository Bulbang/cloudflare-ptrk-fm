import { Block } from './block'

export type PageDataResponse = {
    recordMap: {
        block: {
            [key: string]: Block
        }
        notion_user: {
            [key: string]: {
                role: string
                value: {
                    id: string
                    version: number
                    email: string
                    given_name: string
                    family_name: string
                    profile_photo?: string
                    onboarding_completed: boolean
                    mobile_onboarding_completed?: boolean
                    clipper_onboarding_completed?: boolean
                }
            }
        }
        space: {}
        collection_view: {
            [key: string]: {
                role: string
                value: {
                    id: string
                    version: number
                    type: string
                    name: string
                    format: {
                        table_wrap: boolean
                        table_properties: {
                            width: number
                            visible: boolean
                            property: string
                        }[]
                    }
                    parent_id: string
                    parent_table: string
                    alive: boolean
                    page_sort: string[]
                    query2: {
                        aggregations: {
                            property: string
                            aggregator: string
                        }[]
                    }
                }
            }
        }
        collection: {
            [key: string]: {
                role: string
                value: {
                    id: string
                    version: number
                    schema: {
                        [key: string]: {
                            name: string
                            type: string
                        }
                    }
                    format: {
                        collection_page_properties: {
                            visible: boolean
                            property: string
                        }[]
                    }
                    parent_id: string
                    parent_table: string
                    alive: boolean
                }
            }
        }
    }
    cursor: {
        stack: []
    }
}
