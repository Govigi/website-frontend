import {
  UserCircleIcon,
  ShoppingCartIcon,
  MapPinIcon,
  TruckIcon,
  HeartIcon,
  TagIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  StarIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function ProfilePage(): JSX.Element {
  const user = {
    name: "Alex Morgan",
    email: "alex.morgan@grocerymail.com",
    joinedAt: new Date("2021-08-03T09:00:00Z"),
    loyaltyTier: "Gold",
    rewardsPoints: 1420,
    favoriteStore: "Greenway Market — Kreuzberg",
    bio: "Weekend chef, meal planner, and bulk-buy enthusiast. Loves fresh produce and seasonal finds.",
  };

  const cart = {
    itemsCount: 6,
    subtotal: 48.72,
  };

  const savedAddresses = [
    {
      id: 1,
      label: "Home",
      address: "Friedrichstraße 24, 10117 Berlin, Germany",
      primary: true,
    },
    {
      id: 2,
      label: "Work",
      address: "Leipziger Platz 12, 10117 Berlin, Germany",
      primary: false,
    },
  ];

  const recentOrders = [
    {
      id: "G-2345",
      date: new Date("2025-10-10"),
      items: 12,
      total: 86.45,
      status: "Delivered",
      store: "Greenway Market",
    },
    {
      id: "G-2310",
      date: new Date("2025-09-28"),
      items: 8,
      total: 59.2,
      status: "Out for delivery",
      store: "FreshCorner",
    },
  ];

  const stats = [
    {
      label: "Total Orders",
      value: "24",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Avg. Order Value",
      value: "€68.90",
      change: "+5%",
      trend: "up",
    },
    {
      label: "Favorite Items",
      value: "18",
      change: "+3",
      trend: "up",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and track your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="h-24 w-24 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1 shadow-lg">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <CheckBadgeIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">{user.loyaltyTier} Member</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{user.bio}</p>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>Joined {user.joinedAt.toLocaleDateString()}</span>
                  </div>
                </div>

                <button className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2">
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Stats</h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    </div>
                    <div className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <ShoppingCartIcon className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current Cart</div>
                    <div className="text-lg font-bold text-gray-900">
                      {cart.itemsCount} items • €{cart.subtotal.toFixed(2)}
                    </div>
                    <button className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1 hover:gap-2 transition-all">
                      Continue Shopping
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <TagIcon className="h-7 w-7 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rewards Points</div>
                    <div className="text-lg font-bold text-gray-900">
                      {user.rewardsPoints} pts
                    </div>
                    <button className="text-sm text-yellow-600 font-semibold mt-2 flex items-center gap-1 hover:gap-2 transition-all">
                      Redeem Now
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <HeartIcon className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Favorites</div>
                    <div className="text-lg font-bold text-gray-900">Saved Items</div>
                    <button className="text-sm text-purple-600 font-semibold mt-2 flex items-center gap-1 hover:gap-2 transition-all">
                      View All
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses & Orders Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Saved Addresses */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
                  <button className="text-sm text-green-600 font-semibold flex items-center gap-1">
                    Add New
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all ${
                      addr.primary 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <MapPinIcon className={`h-5 w-5 mt-0.5 ${
                          addr.primary ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{addr.label}</span>
                            {addr.primary && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <button className="text-sm text-green-600 font-semibold flex items-center gap-1">
                    View All
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <TruckIcon className="h-5 w-5 mt-0.5 text-gray-400" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {order.id} • {order.store}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {order.items} items • €{order.total.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "Delivered" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </div>
                          <button className="text-xs text-green-600 font-medium mt-2 block">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personalized Offers */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Personalized Offers</h3>
                  <p className="text-green-100 max-w-2xl">
                    Get exclusive discounts and weekly deals based on your favorites and past orders. 
                    Check your rewards to redeem vouchers and save more on your next grocery haul.
                  </p>
                </div>
                <button className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  View Offers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}