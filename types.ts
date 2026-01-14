
export type OrderStatus = 
  | 'China_Store' 
  | 'China_Warehouse' 
  | 'En_Route' 
  | 'Libya_Warehouse' 
  | 'Out_for_Delivery' 
  | 'Delivered';

export interface Location {
  lat: number;
  lng: number;
}

export interface AppNotification {
  id: string;
  orderCode: string;
  title: string;
  body: string;
  timestamp: number;
  isRead: boolean;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  currentPhysicalLocation: string; // Detailed text location
  status: OrderStatus;
  customerLocation?: Location;
  driverLocation?: Location;
  updatedAt: number;
}

export type AppView = 'admin' | 'user' | 'driver';
export type Language = 'ar' | 'en';
