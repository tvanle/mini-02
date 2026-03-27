import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_PRODUCTS_KEY = 'liked_products';

export async function getLikedProductIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(LIKED_PRODUCTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function isProductLiked(productId: number): Promise<boolean> {
  const liked = await getLikedProductIds();
  return liked.includes(productId);
}

export async function toggleProductLike(productId: number): Promise<boolean> {
  const liked = await getLikedProductIds();
  const next = liked.includes(productId) ? liked.filter((id) => id !== productId) : [...liked, productId];
  await AsyncStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(next));
  return next.includes(productId);
}
