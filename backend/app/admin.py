from django.contrib import admin
from .models import Category, Item, ItemImage, Booking, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'price_per_day')
    list_filter = ('category', )
    search_fields = ('title', 'description')
    raw_id_fields = ('user', 'category')
    date_hierarchy = 'created_at'

@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ('item', 'image_preview')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        return obj.image.url if obj.image else ''
    image_preview.short_description = 'Preview'

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('item', 'user', 'start_date', 'end_date', 'status', 'total_price')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('item__title', 'user__email')
    raw_id_fields = ('item', 'user')
    date_hierarchy = 'created_at'
    
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('booking__item__title', 'comment')
    raw_id_fields = ('booking',)
    date_hierarchy = 'created_at'