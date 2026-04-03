export interface Asset {
    id: string;
    name: string;
    type: 'folder' | 'image';
    parentId: string | null;
    size?: number;
    url?: string;
    itemsCount?: number;
}

export interface DirectoryNode {
    name: string;
    path: string;
    children: DirectoryNode[];
}
