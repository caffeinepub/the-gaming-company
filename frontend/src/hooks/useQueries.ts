import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category } from '../backend';
import type { Product, Sponsor, AddProductParams, EditProductParams, BackendOrder, OrderItem } from '../backend';

// ─── Category Mapping ─────────────────────────────────────────────────────────
// Maps frontend display categories to backend Category enum values
export const FRONTEND_TO_BACKEND_CATEGORY: Record<string, Category> = {
  games: Category.other,
  controllers: Category.clothing,
  consoles: Category.electronics,
  accessories: Category.accessorie,
};

export const BACKEND_TO_FRONTEND_CATEGORY: Record<string, string> = {
  [Category.other]: 'games',
  [Category.clothing]: 'controllers',
  [Category.electronics]: 'consoles',
  [Category.accessorie]: 'accessories',
};

// ─── Products ────────────────────────────────────────────────────────────────

export function useAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllProducts();
      } catch (err) {
        console.error('getAllProducts error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(frontendCategory: string) {
  const { actor, isFetching } = useActor();

  const backendCategory = FRONTEND_TO_BACKEND_CATEGORY[frontendCategory];

  return useQuery<Product[]>({
    queryKey: ['products', frontendCategory],
    queryFn: async () => {
      if (!actor) return [];
      if (!backendCategory) return [];
      try {
        return await actor.getProductsByCategory(backendCategory);
      } catch (err) {
        console.error(`getProductsByCategory(${frontendCategory}) error:`, err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!backendCategory,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      price,
      description,
      imageUrl,
      category,
    }: {
      name: string;
      price: bigint;
      description: string;
      imageUrl: string;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const backendCategory = FRONTEND_TO_BACKEND_CATEGORY[category] ?? Category.other;
      const params: AddProductParams = {
        name,
        price,
        description,
        imageUrl,
        category: backendCategory,
      };
      return actor.addProduct(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      console.error('addProduct error:', err);
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      price,
      description,
      imageUrl,
      category,
    }: {
      id: bigint;
      name: string;
      price: bigint;
      description: string;
      imageUrl: string;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const backendCategory = FRONTEND_TO_BACKEND_CATEGORY[category] ?? Category.other;
      const params: EditProductParams = {
        id,
        name,
        price,
        description,
        imageUrl,
        category: backendCategory,
      };
      return actor.editProduct(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      console.error('editProduct error:', err);
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      console.error('deleteProduct error:', err);
    },
  });
}

// ─── Sponsors ────────────────────────────────────────────────────────────────

export function useAllSponsors() {
  const { actor, isFetching } = useActor();

  return useQuery<Sponsor[]>({
    queryKey: ['sponsors'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSponsors();
      } catch (err) {
        console.error('getAllSponsors error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      logoUrl,
      description,
    }: {
      name: string;
      logoUrl: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addSponsor(name, logoUrl, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useEditSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      logoUrl,
      description,
    }: {
      id: bigint;
      name: string;
      logoUrl: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.editSponsor(id, name, logoUrl, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useDeleteSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteSponsor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendOrder[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrders();
      } catch (err) {
        console.error('getOrders error:', err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fullName,
      email,
      phoneNumber,
      address,
      items,
      total,
    }: {
      fullName: string;
      email: string;
      phoneNumber: string;
      address: string;
      items: OrderItem[];
      total: bigint;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.placeOrder(fullName, email, phoneNumber, address, items, total);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => {
      console.error('placeOrder error:', err);
    },
  });
}
