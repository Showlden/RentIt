from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)  

    def __str__(self):
        return self.name

class Item(models.Model):
    user = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    address = models.CharField(max_length=200, blank=True)  
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
    
class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/')

    def __str__(self):
        return f"Фото {self.item.title}"
    
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает подтверждения'),
        ('confirmed', 'Подтверждено'),
        ('rejected', 'Отклонено'),
        ('completed', 'Завершено'),
    ]

    item = models.ForeignKey('Item', on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey('account.CustomUser', on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Бронирование #{self.id}"

    def save(self, *args, **kwargs):
        if not self.total_price and self.start_date and self.end_date:
            days = (self.end_date - self.start_date).days
            self.total_price = self.item.price_per_day * days
        super().save(*args, **kwargs)
        
class Review(models.Model):
    booking = models.OneToOneField('Booking', on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Отзыв на {self.booking.item.title}"