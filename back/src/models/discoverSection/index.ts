import mongoose from 'mongoose';

const DiscoverSectionSchema = new mongoose.Schema({
  name: String,
  order: Number,
  products: [{
    id: Number,
    productId: Number,
    productName: String,
    productPrice: Number,
    productImage: String,
    productUrl: String,
    categoryName: String,
    keyword: String,
    rank: Number,
    isRocket: Boolean,
    isFreeShipping: Boolean,
    caption: String,
    report: String,
    detail: {
  id: Number,
  hash: String,
  name: String,
  option: String,
  stock: Number,
  discount_rate: Number,
  discount_price: Number,
  price: Number,
  price_per_unit: String,
  membership_price_per_unit: String,
  code: String,
  group: String,
  content: [String],
  brand: String,
  reviews: Number,
  ratings: Number,
  category: String,
  location: String,
  url: String,
  canonical_url: String,
  favorite: String,
  notification: String,
  thumbnail: String,
  express_shipping: String,
  highest_price: Number,
  lowest_price: Number,
  average_price: Number,
  regular_price: Number,
  highest_regular_price: Number,
  lowest_regular_price: Number,
  average_regular_price: Number,
  membership_price: Number,
  highest_membership_price: Number,
  lowest_membership_price: Number,
  average_membership_price: Number,
  picture: String,
  photo: String,
  purchase_index: Number,
    },
    review: {
      pros: [String],
      cons: [String]
    },
  }]
}, {
  timestamps: true,
});

const model = mongoose.models.DiscoverSections || mongoose.model('DiscoverSections', DiscoverSectionSchema);
/*
model.insertMany([
{
    "name": "더잠2",
    "order": 2,
    "products": [
        {
            "id": 3,
            "productId": 3,
            "productName": "테스트3",
            "productPrice": 1,
            "productImage": "https://naver.com",
            "productUrl": "https://naver.com",
            "categoryName": "더잠",
            "keyword": "",
            "rank": 0,
            "isRocket": false,
            "isFreeShipping": false,
            "caption": "caption",
            "report": "report",
            "detail": {
              id: 3,
              productId: 3,
                "reviews": 555,
                "ratings": 5
            },
            "review": {
                "pros": [
                    "pros1",
                    "pros2"
                ],
                "cons": [
                    "cons1",
                    "cons2"
                ]
            }
        },
        {
            "id": 4,
            "productId": 4,
            "productName": "테스트4",
            "productPrice": 1,
            "productImage": "https://naver.com",
            "productUrl": "https://naver.com",
            "categoryName": "더잠",
            "keyword": "",
            "rank": 0,
            "isRocket": false,
            "isFreeShipping": false,
            "caption": "caption",
            "report": "report",
            "detail": {
              id: 4,
              productId: 4,
                "reviews": 505,
                "ratings": 4
            },
            "review": {
                "pros": [
                    "pros1",
                    "pros2"
                ],
                "cons": [
                    "cons1",
                    "cons2"
                ]
            }
        }
    ]
}, {
    "name": "더잠",
    "order": -1,
    "products": [
        {
            "id": 1,
            "productId": 1,
            "productName": "테스트1",
            "productPrice": 1,
            "productImage": "https://naver.com",
            "productUrl": "https://naver.com",
            "categoryName": "더잠",
            "keyword": "",
            "rank": 0,
            "isRocket": false,
            "isFreeShipping": false,
            "caption": "caption",
            "report": "report",
            "detail": {
              id: 1,
              productId: 1,
                "reviews": 555,
                "ratings": 5
            },
            "review": {
                "pros": [
                    "pros1",
                    "pros2"
                ],
                "cons": [
                    "cons1",
                    "cons2"
                ]
            }
        },
        {
            "id": 2,
            "productId": 2,
            "productName": "테스트2",
            "productPrice": 1,
            "productImage": "https://naver.com",
            "productUrl": "https://naver.com",
            "categoryName": "더잠",
            "keyword": "",
            "rank": 0,
            "isRocket": false,
            "isFreeShipping": false,
            "caption": "caption",
            "report": "report",
            "detail": {
              id: 2,
              productId: 2,
                "reviews": 505,
                "ratings": 4
            },
            "review": {
                "pros": [
                    "pros1",
                    "pros2"
                ],
                "cons": [
                    "cons1",
                    "cons2"
                ]
            }
        }
    ]
}

])
*/

export default model;
