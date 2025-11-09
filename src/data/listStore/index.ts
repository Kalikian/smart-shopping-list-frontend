// Barrel export: single entry-point for the data layer.
export * from "./types";
export {
    // multi-list
    createAndSelectList,
    getAllLists,
    selectList,
    renameCurrentList,
    deleteListById,
    // legacy single-list API
    createNewList,
    replaceItems,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    removeItem,
    loadSnapshot,
    saveSnapshot,
    // name utilities
    nameExists,
    getListMetaByName,
    createAndSelectListUnique,
    renameCurrentListUnique,
    openExistingByName,
    // sync/maintenance
    flushPendingOps,
    resetStorage,
} from "./api";
