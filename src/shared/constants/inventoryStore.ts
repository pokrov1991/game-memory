export const INVENTORY_STORE_CONFIG = [
    {
        id: 1,
        type: 'helmet',
        name: 'Шлем астронавта',
        desc: 'Обеспечивает базовую защиту.',
        price: 0,
        organs: [],
        hp: 0,
        isPaid: false,
        isDressed: false
    },
    {
        id: 2,
        type: 'plastron',
        name: 'Скафандр астронавта',
        desc: 'Обеспечивает базовую защиту.',
        price: 0,
        organs: [],
        hp: 0,
        isPaid: false,
        isDressed: false
    },
    {
        id: 3,
        type: 'helmet',
        name: 'Маска щитомордника',
        desc: 'Повышает здоровье на 20 единиц.',
        price: 200,
        organs: [
            { id: 1, name: 'Камень щитомордника', count: 3 },
        ],
        hp: 20,
        isPaid: false,
        isDressed: false
    },
    {
        id: 4,
        type: 'plastron',
        name: 'Доспех литора',
        desc: 'Повышает здоровье на 30 единиц.',
        price: 300,
        organs: [
            { id: 1, name: 'Камень щитомордника', count: 4 },
            { id: 2, name: 'Кость литора', count: 3 }
        ],
        hp: 30,
        isPaid: false,
        isDressed: false
    },
    {
        id: 5,
        type: 'helmet',
        name: 'Шлем каменовского',
        desc: 'Повышает здоровье на 60 единиц.',
        price: 800,
        organs: [
            { id: 1, name: 'Камень щитомордника', count: 4 },
            { id: 2, name: 'Кость литора', count: 4 },
            { id: 3, name: 'Хромовая пластина', count: 1 },
        ],
        hp: 60,
        isPaid: false,
        isDressed: false
    },
    {
        id: 6,
        type: 'plastron',
        name: 'Броня каменовского',
        desc: 'Повышает здоровье на 70 единиц.',
        price: 1000,
        organs: [
            { id: 1, name: 'Камень щитомордника', count: 6 },
            { id: 2, name: 'Кость литора', count: 5 },
            { id: 3, name: 'Хромовая пластина', count: 2 },
        ],
        hp: 70,
        isPaid: false,
        isDressed: false
    },
    {
        id: 7,
        type: 'helmet',
        name: 'Колпак меркиля',
        desc: 'Повышает здоровье на 40 единиц.',
        price: 500,
        organs: [
            { id: 4, name: 'Ткань меркиля', count: 4 },
        ],
        hp: 40,
        isPaid: false,
        isDressed: false
    },
    {
        id: 8,
        type: 'plastron',
        name: 'Тряпки меркиля',
        desc: 'Повышает здоровье на 50 единиц.',
        price: 600,
        organs: [
            { id: 4, name: 'Ткань меркиля', count: 5 },
        ],
        hp: 50,
        isPaid: false,
        isDressed: false
    },
    {
        id: 9,
        type: 'helmet',
        name: 'Клюв севы',
        desc: 'Повышает здоровье на 70 единиц.',
        price: 1000,
        organs: [
            { id: 1, name: 'Камень щитомордника', count: 6 },
            { id: 3, name: 'Хромовая пластина', count: 2 },
            { id: 4, name: 'Ткань меркиля', count: 2 },
            { id: 5, name: 'Перья титуса', count: 2 },
        ],
        hp: 70,
        isPaid: false,
        isDressed: false
    },
    {
        id: 10,
        type: 'plastron',
        name: 'Броня севы',
        desc: 'Повышает здоровье на 80 единиц.',
        price: 1200,
        organs: [
            { id: 2, name: 'Кость литора', count: 5 },
            { id: 3, name: 'Хромовая пластина', count: 3 },
            { id: 4, name: 'Ткань меркиля', count: 2 },
            { id: 5, name: 'Перья титуса', count: 2 },
        ],
        hp: 80,
        isPaid: false,
        isDressed: false
    },
    {
        id: 11,
        type: 'potion',
        name: 'Противорадиационный кристал',
        desc: 'Добавляет одну ячейку востановления здоровья.',
        price: 2000,
        organs: [],
        hp: 25,
        isPaid: false,
        isDressed: false
    }
]
  