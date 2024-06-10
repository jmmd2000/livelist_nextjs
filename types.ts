// The initial data sent by the client when creating a new user
export interface InitialUserData {
  google_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string;
}

export interface User {
  id?: number;
  google_id: string;
  first_name: string | null;
  last_name: string | null;
  friendcode: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
  households: UserList[]; // Many-to-many relation to List through UserList
  created_lists: List[]; // Lists created by the user
  created_items: Item[]; // Items created by the user
  sentRequests: ListRequest[]; // Requests sent by the user
  receivedRequests: ListRequest[]; // Requests received by the user
}

export interface List {
  id: number;
  name: string;
  created_by: User; // User who created the list
  created_by_google_id: string;
  members: UserList[]; // Users who are members of the list
  requests: ListRequest[]; // Requests associated with the list
  items: Item[]; // Items in the list
  created_at: Date;
  updated_at: Date;
}

export interface UserList {
  user_google_id: string;
  list_id: number;
  user: User; // Reference to the User
  list: List; // Reference to the List
}

export interface ListRequest {
  id: number;
  from_user_google_id: string;
  to_user_google_id: string;
  list_id: number;
  from_user: User; // The user who sent the request
  to_user: User; // The user to whom the request was sent
  list: List; // The list involved in the request
  status: "pending" | "accepted" | "rejected"; // Status of the request
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  id: number;
  name: string;
  best_before?: Date; // Optional best before date
  price_history?: string; // JSON stringified array of prices, optional
  list_id: number;
  list: List; // Reference to the List the item belongs to
  created_by_google_id: string;
  created_by: User; // The user who created the item
  generic: boolean; // Indicates if the item is generic i.e. "milk" instead of "Brand X milk"
  priority: "low" | "normal" | "high"; // Priority of the item
  created_at: Date;
  updated_at: Date;
}
