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
        price: 500,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 3 },
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
        price: 600,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 4 },
            { id: 2, name: 'Шкура голема', count: 3 }
        ],
        hp: 30,
        isPaid: false,
        isDressed: false
    },
    {
        id: 5,
        type: 'helmet',
        name: 'Шлем ИС-2',
        desc: 'Повышает здоровье на 40 единиц.',
        price: 800,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 2 },
            { id: 2, name: 'Шкура голема', count: 6 },
            { id: 3, name: 'Пластина от ИС-2', count: 1 },
        ],
        hp: 40,
        isPaid: false,
        isDressed: false
    },
    {
        id: 6,
        type: 'plastron',
        name: 'Доспех ИС-2',
        desc: 'Повышает здоровье на 50 единиц.',
        price: 1000,
        organs: [
            { id: 1, name: 'Зуб щитомордника', count: 6 },
            { id: 2, name: 'Шкура голема', count: 8 }
        ],
        hp: 50,
        isPaid: false,
        isDressed: false
    },
    {
        id: 7,
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
  