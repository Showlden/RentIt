from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ItemImageViewSet, ItemViewSet, BookingViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename="categories")
router.register(r'items', ItemViewSet, basename="items")
router.register(r'item-images', ItemImageViewSet, basename="item-images")
router.register(r'bookings', BookingViewSet, basename="bookings")
router.register(r'reviews', ReviewViewSet, basename="reviews")

urlpatterns = router.urls