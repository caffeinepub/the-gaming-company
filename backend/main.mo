import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

(with migration = Migration.run)
actor {
  public type Category = { #clothing; #electronics; #accessorie; #other };
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    imageUrl : Text;
    category : Category;
  };

  type Sponsor = {
    id : Nat;
    name : Text;
    logoUrl : Text;
    description : Text;
  };

  type OrderItem = {
    productName : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  public type DeliveryDetails = {
    fullName : Text;
    email : Text;
    phoneNumber : Text;
    address : Text;
  };

  public type BackendOrder = {
    deliveryDetails : DeliveryDetails;
    items : [OrderItem];
    total : Nat;
    timestamp : Time.Time;
    quantity : Nat;
    paymentMethod : Text;
  };

  public type LoyaltyReward = {
    name : Text;
    description : Text;
    pointsRequired : Nat;
  };

  public type Achievements = {
    purchases : Nat;
    reviews : Nat;
    loyaltyRewards : Nat;
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

  public type AddProductParams = {
    name : Text;
    price : Nat;
    description : Text;
    imageUrl : Text;
    category : Category;
  };

  public type EditProductParams = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    imageUrl : Text;
    category : Category;
  };

  var nextId = 0;
  var orders = Map.empty<Nat, BackendOrder>();
  var products = Map.empty<Nat, Product>();
  var sponsors = Map.empty<Nat, Sponsor>();
  var users = Map.empty<Text, { loyaltyPoints : Nat }>();

  public shared ({ caller }) func placeOrder(
    fullName : Text,
    email : Text,
    phoneNumber : Text,
    address : Text,
    items : [OrderItem],
    total : Nat,
  ) : async Nat {
    let details : DeliveryDetails = {
      fullName;
      email;
      phoneNumber;
      address;
    };
    let order : BackendOrder = {
      deliveryDetails = details;
      items;
      total;
      timestamp = Time.now();
      quantity = items.foldLeft(
        0,
        func(acc, item) { acc + item.quantity },
      );
      paymentMethod = "euro";
    };
    orders.add(nextId, order);
    nextId += 1;
    nextId - 1;
  };

  public query ({ caller }) func getOrders() : async [BackendOrder] {
    orders.values().toArray();
  };

  public shared ({ caller }) func addProduct(params : AddProductParams) : async Nat {
    let product : Product = {
      id = nextId;
      category = params.category;
      name = params.name;
      price = params.price;
      description = params.description;
      imageUrl = params.imageUrl;
    };
    products.add(nextId, product);
    nextId += 1;
    product.id;
  };

  public shared ({ caller }) func editProduct(params : EditProductParams) : async () {
    switch (products.get(params.id)) {
      case (?existingProduct) {
        let updatedProduct : Product = {
          existingProduct with
          category = params.category;
          name = params.name;
          price = params.price;
          description = params.description;
          imageUrl = params.imageUrl;
        };
        products.add(params.id, updatedProduct);
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (products.containsKey(id)) {
      products.remove(id);
    } else {
      Runtime.trap("Product does not exist");
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(
      func(product) {
        product.category == category;
      }
    );
  };

  public shared ({ caller }) func addSponsor(name : Text, logoUrl : Text, description : Text) : async () {
    let sponsor : Sponsor = {
      id = nextId;
      name;
      logoUrl;
      description;
    };
    sponsors.add(nextId, sponsor);
    nextId += 1;
  };

  public shared ({ caller }) func editSponsor(id : Nat, name : Text, logoUrl : Text, description : Text) : async () {
    switch (sponsors.get(id)) {
      case (?existingSponsor) {
        let updatedSponsor : Sponsor = {
          existingSponsor with
          name;
          logoUrl;
          description;
        };
        sponsors.add(id, updatedSponsor);
      };
      case (null) {
        Runtime.trap("Sponsor does not exist");
      };
    };
  };

  public shared ({ caller }) func deleteSponsor(id : Nat) : async () {
    if (sponsors.containsKey(id)) {
      sponsors.remove(id);
    } else {
      Runtime.trap("Sponsor does not exist");
    };
  };

  public query ({ caller }) func getAllSponsors() : async [Sponsor] {
    sponsors.values().toArray();
  };

  public shared ({ caller }) func redeemLoyaltyPoints(payerId : Text, amount : Nat) : async () {
    switch (users.get(payerId)) {
      case (?payer) {
        if (payer.loyaltyPoints >= amount) {
          let updatedPayer = {
            payer with
            loyaltyPoints = payer.loyaltyPoints - amount;
          };
          users.add(payerId, updatedPayer);
        } else {
          Runtime.trap("Payer does not have enough loyalty points");
        };
      };
      case (null) {
        Runtime.trap("Payer does not exist");
      };
    };
  };
};
