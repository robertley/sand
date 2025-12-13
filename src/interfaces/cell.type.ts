export type Cell =
    'empty' |
    'sand' |
    'dirt' | 'wet-dirt' | 'dirt-with-seed' | 'wet-dirt-with-seed' |
    'water' | 'water-left' | 'water-right' |
    'fire-0' | 'fire-1' | 'fire-2' | 'fire-3' | 'fire-4' |
    'seed' |
    'plant' |
    'steam' |
    'water-vapor-0' | 'water-vapor-1' | 'water-vapor-2' | 'water-vapor-3' | 'water-vapor-4' |
    'stone' |
    'hole' |
    'sand-portal-0' | 'sand-portal-1' | 'sand-portal-2' | 'sand-portal-3' | 'sand-portal-4' | 'sand-portal-5' | 'sand-portal-6' | 'sand-portal-7' | 'sand-portal-8' |
    'water-portal' | 'torch' |
    'steam-engine-0' | 'steam-engine-1' | 'steam-engine-2' | 'steam-engine-3' | 'steam-engine-4' |
    'wire' |
    'wire-p-l' | 'wire-p-r' | 'wire-p-u' | 'wire-p-d';
    // 'wire-p-l-r' | 'wire-p-l-d' | 'wire-p-l-u' |
    // 'wire-p-r-d' | 'wire-p-r-u' | 'wire-p-r-l' |
    // 'wire-p-u-d' | 'wire-p-u-l' | 'wire-p-u-r' |
    // 'wire-p-d-l' | 'wire-p-d-r' | 'wire-p-d-u';

export const CELL_TYPES = [
    'empty',
    'sand',
    'dirt', 'wet-dirt', 'dirt-with-seed', 'wet-dirt-with-seed',
    'water', 'water-left', 'water-right',
    'fire-0', 'fire-1', 'fire-2', 'fire-3', 'fire-4',
    'steam',
    'stone',
    'hole',
    'sand-portal-0', 'sand-portal-1', 'sand-portal-2', 'sand-portal-3', 'sand-portal-4', 'sand-portal-5', 'sand-portal-6', 'sand-portal-7', 'sand-portal-8',
    'water-portal', 'torch',
    'steam-engine-0', 'steam-engine-1', 'steam-engine-2', 'steam-engine-3', 'steam-engine-4',
    'wire'
];