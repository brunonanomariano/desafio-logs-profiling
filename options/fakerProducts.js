const faker = require('faker')

const fakerProducts = [
    {
        "title": faker.commerce.productName(),
        "price": faker.commerce.price(100, 3000),
        "thumbnail": faker.image.imageUrl()
    },
    {
        "title": faker.commerce.productName(),
        "price": faker.commerce.price(100, 3000),
        "thumbnail": faker.image.imageUrl()
    },
    {
        "title": faker.commerce.productName(),
        "price": faker.commerce.price(100, 3000),
        "thumbnail": faker.image.imageUrl()
    },
    {
        "title": faker.commerce.productName(),
        "price": faker.commerce.price(100, 3000),
        "thumbnail": faker.image.imageUrl()
    },
    {
        "title": faker.commerce.productName(),
        "price": faker.commerce.price(100, 3000),
        "thumbnail": faker.image.imageUrl()
    }  
]

module.exports = fakerProducts