import { useCallback, useRef, useState } from 'react';
import { generateId } from '../utils';

type WithId = { id: string };

interface OptimisticActions<T extends WithId> {
    /** Current list (may contain optimistic items) */
    items: T[];
    /** Add an item optimistically; rollback if async fn rejects */
    add: (item: Omit<T, 'id'>, asyncFn: (item: T) => Promise<T>) => Promise<void>;
    /** Remove an item optimistically; rollback if async fn rejects */
    remove: (id: string, asyncFn: (id: string) => Promise<void>) => Promise<void>;
    /** Update an item optimistically; rollback if async fn rejects */
    update: (id: string, patch: Partial<T>, asyncFn: (id: string, patch: Partial<T>) => Promise<T>) => Promise<void>;
}

/**
 * useOptimisticList
 *
 * Manages a list with optimistic UI mutations.
 * All mutations apply instantly to local state and rollback on error.
 *
 * Usage:
 *   const { items, add, remove } = useOptimisticList(mockSalesInvoices);
 */
export function useOptimisticList<T extends WithId>(initialData: T[]): OptimisticActions<T> {
    const [items, setItems] = useState<T[]>(initialData);
    const rollbackRef = useRef<T[]>(initialData);

    const add = useCallback(async (itemData: Omit<T, 'id'>, asyncFn: (item: T) => Promise<T>) => {
        const tempId = `temp-${generateId()}`;
        const optimisticItem = { ...itemData, id: tempId } as T;
        rollbackRef.current = items;
        setItems(prev => [optimisticItem, ...prev]);
        try {
            const confirmed = await asyncFn(optimisticItem);
            // Replace temp item with confirmed server response
            setItems(prev => prev.map(it => it.id === tempId ? confirmed : it));
        } catch {
            setItems(rollbackRef.current);
            throw new Error('Saqlashda xato yuz berdi. Qayta urinib ko\'ring.');
        }
    }, [items]);

    const remove = useCallback(async (id: string, asyncFn: (id: string) => Promise<void>) => {
        rollbackRef.current = items;
        setItems(prev => prev.filter(it => it.id !== id));
        try {
            await asyncFn(id);
        } catch {
            setItems(rollbackRef.current);
            throw new Error("O'chirishda xato yuz berdi.");
        }
    }, [items]);

    const update = useCallback(async (
        id: string,
        patch: Partial<T>,
        asyncFn: (id: string, patch: Partial<T>) => Promise<T>
    ) => {
        rollbackRef.current = items;
        setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
        try {
            const confirmed = await asyncFn(id, patch);
            setItems(prev => prev.map(it => it.id === id ? confirmed : it));
        } catch {
            setItems(rollbackRef.current);
            throw new Error('Yangilashda xato yuz berdi.');
        }
    }, [items]);

    return { items, add, remove, update };
}
