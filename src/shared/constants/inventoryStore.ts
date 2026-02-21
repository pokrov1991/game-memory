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
        desc: 'Повышает защиту на 20 единиц.',
        price: 500,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 5 },
            { id: 2, name: 'Шкура голема', count: 3 }
        ],
        hp: 20,
        isPaid: false,
        isDressed: false
    },
    {
        id: 4,
        type: 'plastron',
        name: 'Доспех голема',
        desc: 'Повышает защиту на 30 единиц.',
        price: 800,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 8 },
            { id: 2, name: 'Шкура голема', count: 5 }
        ],
        hp: 30,
        isPaid: false,
        isDressed: false
    },
    {
        id: 5,
        type: 'helmet',
        name: 'Шлем большой',
        desc: 'Повышает защиту на 50 единиц.',
        price: 1000,
        organs: [
            { id: 1, name: 'Монстр щитомордника', count: 99 },
            { id: 2, name: 'Шкура голема', count: 99 }
        ],
        hp: 50,
        isPaid: false,
        isDressed: false
    },
    {
        id: 6,
        type: 'plastron',
        name: 'Большой доспех',
        desc: 'Повышает защиту на 60 единиц.',
        price: 1200,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 99 },
            { id: 2, name: 'Шкура голема', count: 99 }
        ],
        hp: 60,
        isPaid: false,
        isDressed: false
    },
    {
        id: 7,
        type: 'potion',
        name: 'Зелье здоровья',
        desc: 'Восстанавливает немного здоровья.',
        price: 20,
        organs: [],
        hp: 10,
        isPaid: false,
        isDressed: false
    }
]
  