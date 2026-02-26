import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type PromoteCategory = { #clothing; #electronics; #accessorie; #other };
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    imageUrl : Text;
    category : PromoteCategory;
  };

  type Sponsor = {
    id : Nat;
    name : Text;
    logoUrl : Text;
    description : Text;
  };

  type OldOrder = {
    id : Nat;
    productId : Nat;
    customerName : Text;
    address : Text;
    email : Text;
    status : Text;
    quantity : Nat;
    totalPrice : Nat;
    paymentMethod : Text;
  };

  type OldActor = {
    nextProductId : Nat;
    nextSponsorId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    sponsors : Map.Map<Nat, Sponsor>;
    orders : Map.Map<Nat, OldOrder>;
    users : Map.Map<Text, { loyaltyPoints : Nat }>;
  };

  type OrderItem = {
    productName : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  type DeliveryDetails = {
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    address : Text;
  };

  type BackendOrder = {
    deliveryDetails : DeliveryDetails;
    items : [OrderItem];
    total : Nat;
    timestamp : Int;
    quantity : Nat;
    paymentMethod : Text;
  };

  type NewActor = {
    nextId : Nat;
    products : Map.Map<Nat, Product>;
    sponsors : Map.Map<Nat, Sponsor>;
    orders : Map.Map<Nat, BackendOrder>;
    users : Map.Map<Text, { loyaltyPoints : Nat }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextId = old.nextProductId + old.nextSponsorId + old.nextOrderId;
      products = old.products;
      sponsors = old.sponsors;
      orders = Map.empty<Nat, BackendOrder>();
      users = old.users;
    };
  };
};
