import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: Category;
    price: bigint;
}
export interface AddProductParams {
    name: string;
    description: string;
    imageUrl: string;
    category: Category;
    price: bigint;
}
export type Time = bigint;
export interface Sponsor {
    id: bigint;
    name: string;
    description: string;
    logoUrl: string;
}
export interface OrderItem {
    productName: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface BackendOrder {
    total: bigint;
    paymentMethod: string;
    deliveryDetails: DeliveryDetails;
    timestamp: Time;
    quantity: bigint;
    items: Array<OrderItem>;
}
export interface EditProductParams {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: Category;
    price: bigint;
}
export interface DeliveryDetails {
    fullName: string;
    email: string;
    address: string;
    phoneNumber: string;
}
export enum Category {
    clothing = "clothing",
    other = "other",
    accessorie = "accessorie",
    electronics = "electronics"
}
export interface backendInterface {
    addProduct(params: AddProductParams): Promise<bigint>;
    addSponsor(name: string, logoUrl: string, description: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteSponsor(id: bigint): Promise<void>;
    editProduct(params: EditProductParams): Promise<void>;
    editSponsor(id: bigint, name: string, logoUrl: string, description: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSponsors(): Promise<Array<Sponsor>>;
    getOrders(): Promise<Array<BackendOrder>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    placeOrder(fullName: string, email: string, phoneNumber: string, address: string, items: Array<OrderItem>, total: bigint): Promise<bigint>;
    redeemLoyaltyPoints(payerId: string, amount: bigint): Promise<void>;
}
