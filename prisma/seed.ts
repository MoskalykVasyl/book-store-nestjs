import { Genre, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.STAGING_DATABASE_URL } },
});

type SeedBook = {
  title: string;
  price: number;
  countPage: number;
  genre: Genre;
  publicYear: string; // 'YYYY-MM-DD'
  description: string;
  imageUrl?: string;
};

type SeedAuthor = {
  firstName: string;
  lastName: string;
  biography?: string;
  imageUrl?: string;
  books: SeedBook[];
};

const data: SeedAuthor[] = [
  {
    firstName: 'Стівен',
    lastName: 'Кінг',
    biography: 'Американський письменник, майстер жахів і трилерів.',
    books: [
      {
        title: 'Сяйво',
        price: 320,
        countPage: 447,
        genre: Genre.Horror,
        publicYear: '1977-01-28',
        description: 'Історія сімї, яка зимує в ізольованому готелі з жахливим минулим.',
      },
      {
        title: 'Воно',
        price: 480,
        countPage: 1138,
        genre: Genre.Horror,
        publicYear: '1986-09-15',
        description: 'Група друзів стикається з давнім злом у містечку Деррі.',
      },
    ],
  },
  {
    firstName: 'Джон',
    lastName: 'Толкін',
    biography: 'Англійський письменник і філолог, автор «Володаря перснів».',
    books: [
      {
        title: 'Гобіт',
        price: 290,
        countPage: 310,
        genre: Genre.Fantasy,
        publicYear: '1937-09-21',
        description: 'Подорож гобіта Більбо Беггінса до Самотньої гори.',
      },
      {
        title: 'Володар перснів: Братство персня',
        price: 380,
        countPage: 423,
        genre: Genre.Fantasy,
        publicYear: '1954-07-29',
        description: 'Початок походу для знищення Єдиного персня.',
      },
    ],
  },
  {
    firstName: 'Агата',
    lastName: 'Крісті',
    biography: 'Британська письменниця, королева детективу.',
    books: [
      {
        title: 'Вбивство у «Східному експресі»',
        price: 250,
        countPage: 256,
        genre: Genre.Detective,
        publicYear: '1934-01-01',
        description: 'Еркюль Пуаро розслідує вбивство у потязі, що застряг у снігу.',
      },
      {
        title: 'І не лишилось жодного',
        price: 260,
        countPage: 272,
        genre: Genre.Mystery,
        publicYear: '1939-11-06',
        description: 'Десятеро незнайомців на острові, і хтось вбиває їх одного за одним.',
      },
    ],
  },
  {
    firstName: 'Джейн',
    lastName: 'Остін',
    biography: 'Англійська письменниця, авторка класичних романів про любов і суспільство.',
    books: [
      {
        title: 'Гордість і упередження',
        price: 270,
        countPage: 432,
        genre: Genre.RomanceNovel,
        publicYear: '1813-01-28',
        description: 'Історія Елізабет Беннет і містера Дарсі.',
      },
    ],
  },
  {
    firstName: 'Волтер',
    lastName: 'Айзексон',
    biography: 'Американський письменник і журналіст, автор біографій видатних людей.',
    books: [
      {
        title: 'Стів Джобс',
        price: 420,
        countPage: 656,
        genre: Genre.Biography,
        publicYear: '2011-10-24',
        description: 'Біографія засновника Apple на основі численних інтервю.',
      },
    ],
  },
];

async function main() {
  let authorsCreated = 0;
  let booksCreated = 0;

  for (const { books, ...authorData } of data) {
    let author = await prisma.author.findFirst({
      where: {
        firstName: authorData.firstName,
        lastName: authorData.lastName,
      },
    });

    if (!author) {
      author = await prisma.author.create({ data: authorData });
      authorsCreated++;
    }

    for (const book of books) {
      const exists = await prisma.book.findFirst({
        where: { title: book.title, authorId: author.id },
      });
      if (exists) continue;

      await prisma.book.create({
        data: {
          ...book,
          publicYear: new Date(book.publicYear),
          authorId: author.id,
        },
      });
      booksCreated++;
    }
  }

  console.log(`Seed завершено: авторів створено ${authorsCreated}, книг створено ${booksCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());