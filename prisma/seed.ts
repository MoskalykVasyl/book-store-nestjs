import 'dotenv/config';
import { Genre, UserRole, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.STAGING_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
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

type SeedUser = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

const data: SeedAuthor[] = [
  {
    firstName: 'Stephen',
    lastName: 'King',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791314989/StepganKing_dqy727.jpg',
    biography:
      'Prolific American author of horror, supernatural fiction, and suspense, often called King of Horror. He is the author of more than sixty books, all of them worldwide bestsellers.',
    books: [
      {
        title: 'The Shining',
        price: 9,
        countPage: 672,
        genre: Genre.Horror,
        publicYear: '2012-06-26',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791616011/TheShining_jrn9uz.jpg',
        description:
          "Jack Torrance's new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he'll have plenty of time to spend reconnecting with his family and working on his writing. But as the harsh winter weather sets in, the idyllic location feels ever more remote . . . and more sinister. And the only one to notice the strange and terrible forces gathering around the Overlook is Danny Torrance, a uniquely gifted five-year-old.",
      },
      {
        title: 'It',
        price: 15,
        countPage: 1138,
        genre: Genre.Horror,
        publicYear: '1987-01-01',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791315065/It_a0k5gk.jpg',
        description:
          "Welcome to Derry, Maine. It's a small city, a place as hauntingly familiar as your own hometown. Only in Derry the haunting is real. They were seven teenagers when they first stumbled upon the horror. Now they are grown-up men and women who have gone out into the big world to gain success and happiness. But the promise they made twenty-eight years ago calls them reunite in the same place where, as teenagers, they battled an evil creature that preyed on the city's children. Now, children are being murdered again and their repressed memories of that terrifying summer return as they prepare to once again battle the monster lurking in Derry's sewers.",
      },
    ],
  },
  {
    firstName: 'J.R.R.',
    lastName: 'Tolkein',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791314989/Tolkein_j0wrvh.jpg',
    biography:
      'English writer, philologist, and academic, best known as the author of the high fantasy works.',
    books: [
      {
        title: 'The Hobbit',
        price: 11,
        countPage: 310,
        genre: Genre.Fantasy,
        publicYear: '1937-09-21',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791315063/Hobbit_bp4uaf.jpg',
        description:
          'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely travelling further than the pantry of his hobbit-hole in Bag End. But his contentment is disturbed when the wizard, Gandalf, and a company of thirteen dwarves arrive on his doorstep one day to whisk him away on an unexpected quest for treasure there and back again. They have a plot to raid the treasure hoard of Smaug the Magnificent, a large and very dangerous dragon . . .',
      },
      {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        price: 10,
        countPage: 544,
        genre: Genre.Fantasy,
        publicYear: '2020-10-06',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791616895/TheFellowshipOfTheRing_epjc8n.jpg',
        description:
          'The Fellowship of the Ring, the first volume in the trilogy, tells of the fateful power of the One Ring. It begins a magnificent tale of adventure that will plunge the members of the Fellowship of the Ring into a perilous quest and set the stage for the ultimate clash between the powers of good and evil.',
      },
      {
        title: 'The Two Towers',
        price: 9,
        countPage: 448,
        genre: Genre.Fantasy,
        publicYear: '2020-10-06',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791617144/TheTwoTowers_cpzxem.jpg',
        description:
          "The Two Towers is the second part of J.R.R. Tolkien’s epic adventure The Lord of the Rings. One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. J.R.R. Tolkien's classic high fantasy trilogy The Lord of the Rings, now with a fresh new package for Book 2, The Two Towers. Frodo and his Companions of the Ring have been beset by danger during their quest to prevent the Ruling Ring from falling into the hands of the Dark Lord by destroying it in the Cracks of Doom. They have lost the wizard, Gandalf, in a desperate battle in the Mines of Moria. And Boromir, seduced by the power of the Ring, tried to seize it by force. While Frodo and Sam made their escape, the rest of the company was attacked by Orcs. Now they continue their perilous journey alone down the great River Anduin in this timeless fantasy classic―alone, that is, save for the mysterious creeping figure that follows wherever they go.",
      },
      {
        title: 'The Return of the King',
        price: 10,
        countPage: 544,
        genre: Genre.Fantasy,
        publicYear: '2020-10-06',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791617475/TheReturnOfTheKing_zrplzy.jpg',
        description:
          "Continue your journey through Middle-earth... The inspiration for the original series on Prime Video, The Lord of the Rings: The Rings of Power. The Return of the King is the third part of J.R.R. Tolkien's classic epic fantasy adventure The Lord of the Rings. One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. J.R.R. Tolkien's classic high fantasy trilogy The Lord of the Rings, now with a fresh new package for Book 3, The Return of the King. The Dark Lord Sauron has risen, and as he unleashes hordes of Orcs to conquer all Middle-earth, hobbits Frodo and Sam struggle deep into his realm on their epic quest into Mordor. To defeat Sauron and win the War of the Ring, the One Ring must be destroyed in the fires of Mount Doom. But the way is impossibly hard, and Frodo is weakening. The Ring corrupts all who bear it and Frodo's time is running out.",
      },
    ],
  },
  {
    firstName: 'Agatha',
    lastName: 'Christie',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791617849/AgataKristi_fc5poj.jpg',
    biography:
      'Famous English crime novelist and playwright, best known for her 66 detective novels.',
    books: [
      {
        title: 'Murder on the Orient Express',
        price: 13,
        countPage: 336,
        genre: Genre.Detective,
        publicYear: '2011-03-29',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791617818/MurderOnTheOrientExpress_bxhtvm.jpg',
        description:
          'Just after midnight, the famous Orient Express is stopped in its tracks by a snowdrift. By morning, the millionaire Samuel Edward Ratchett lies dead in his compartment, stabbed a dozen times, his door locked from the inside. Without a shred of doubt, one of his fellow passengers is the murderer. Isolated by the storm, detective Hercule Poirot must find the killer among a dozen of the dead man’s enemies, before the murderer decides to strike again.',
      },
      {
        title: 'And Then There Were None',
        price: 14,
        countPage: 272,
        genre: Genre.Mystery,
        publicYear: '1939-11-06',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791315063/andThenThereWereNone_b6djru.jpg',
        description:
          '"Ten . . ." Ten strangers are lured to an isolated island mansion off the Devon coast by a mysterious "U. N. Owen." "Nine . . ." At dinner a recorded message accuses each of them in turn of having a guilty secret, and by the end of the night one of the guests is dead. "Eight . . ." Stranded by a violent storm, and haunted by a nursery rhyme counting down one by one . . . as one by one . . . they begin to die. "Seven . . ." Which among them is the killer and will any of them survive?',
      },
    ],
  },
  {
    firstName: 'Jane',
    lastName: 'Austen',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791618313/Jane-Austen_v28kvk.webp',
    biography:
      'Jane Austen was born on December 16, 1775 at Steventon near Basingstoke, the seventh child of the rector of the parish. She lived with her family at Steventon until they moved to Bath when her father retired in 1801. After his death in 1805, she moved around with her mother; in 1809, they settled in Chawton, near Alton, Hampshire. Here she remained, except for a few visits to London, until in May 1817 she moved to Winchester to be near her doctor. There she died on July 18, 1817. As a girl Jane Austen wrote stories, including burlesques of popular romances. Her works were only published after much revision, four novels being published in her lifetime. These are Sense and Sensibility (1811), Pride and Prejudice (1813), Mansfield Park (1814) and Emma(1816). Two other novels, Northanger Abbey and Persuasion, were published posthumously in 1818 with a biographical notice by her brother, Henry Austen, the first formal announcement of her authorship. Persuasion was written in a race against failing health in 1815-16. She also left two earlier compositions, a short epistolary novel, Lady Susan, and an unfinished novel, The Watsons. At the time of her death, she was working on a new novel, Sanditon, a fragmentary draft of which survives.',
    books: [
      {
        title: 'Pride and Prejudice',
        price: 15,
        countPage: 432,
        genre: Genre.RomanceNovel,
        publicYear: '1813-01-28',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791729642/PrideAndPrejuce_i5f42t.jpg',
        description:
          'Pride and Prejudice is an 1813 romantic novel by Jane Austen. It charts the emotional development of protagonist Elizabeth Bennet, who learns the error of making hasty judgments and comes to appreciate the difference between the superficial and the essential. The comedy of the writing lies in the depiction of manners, education, marriage, and money during the British Regency period.',
      },
    ],
  },
  {
    firstName: 'Karen',
    lastName: 'Blumenthal',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791618785/KarenBlumenthal_uklsf8.jpg',
    biography:
      'Karen Frances Blumenthal was an American business journalist, published author, and educator.',
    books: [
      {
        title: 'Steve Jobs: The Man Who Thought Different',
        price: 9,
        countPage: 320,
        genre: Genre.Biography,
        publicYear: '2012-02-14',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791618863/SteveJobs_qwd2qq.jpg',
        description:
          '"Your time is limited. . . . have the courage to follow your heart and intuition." ― Steve Jobs From the start, his path was never predictable. Steve Jobs was given up for adoption at birth, dropped out of college after one semester, and at the age of twenty, created Apple in his parents garage with his friend Steve Wozniack.',
      },
    ],
  },
  {
    firstName: 'J.K.',
    lastName: 'Rowling',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791314988/Rowling_rx2owp.jpg',
    biography:
      'British author and philanthropist, famous for creating the world-renowned Harry Potter series.',
    books: [
      {
        title: "Harry Potter and the Sorcerer's Stone",
        price: 12,
        countPage: 314,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791619314/HarryPotterAndTheSorcerStone_kblgei.jpg',
        description:
          'Harry Potter lives hidden away in the cupboard under the stairs at Number Four, Privet Drive. When letters start arriving for him, they are swiftly confiscated by his cruel aunt and uncle. Then, on Harry’s eleventh birthday, a great giant of a man called Rubeus Hagrid bursts in with some astonishing news: Harry Potter is a wizard, and he has a place at Hogwarts School of Witchcraft and Wizardry. An incredible adventure is about to begin!',
      },
      {
        title: 'Harry Potter and the Chamber of Secrets',
        price: 12,
        countPage: 344,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791619884/HarryPotterAndTheChamberOfSecrets_ztexer.jpg',
        description:
          "Harry Potter's summer has included the worst birthday ever, doomy warnings from a house-elf called Dobby, and rescue from the Dursleys by his friend Ron Weasley in a magical flying car! Back at Hogwarts School of Witchcraft and Wizardry for his second year, Harry hears strange whispers echo through empty corridors - and then the attacks start. Students are found as though turned to stone... Dobby's sinister predictions seem to be coming true.",
      },
      {
        title: 'Harry Potter and the Prisoner of Azkaban',
        price: 11,
        countPage: 437,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791620048/HarryPotterAndThePrisonerOfAzkaban_gaugg3.jpg',
        description:
          "When the Knight Bus crashes through the darkness and screeches to a halt in front of him, it's the start of another far from ordinary year at Hogwarts for Harry Potter. Sirius Black, escaped mass-murderer and follower of Lord Voldemort, is on the run - and they say he is coming after Harry. In his first ever Divination class, Professor Trelawney sees an omen of death in Harry's tea leaves... But perhaps most terrifying of all are the Dementors patrolling the school grounds, with their soul-sucking kiss...",
      },
      {
        title: 'Harry Potter and the Goblet of Fire',
        price: 11,
        countPage: 740,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791620193/HarryPotterAndTheGolbetOfFire_tl291n.jpg',
        description:
          "The Triwizard Tournament is to be held at Hogwarts. Only wizards who are over seventeen are allowed to enter - but that doesn't stop Harry dreaming that he will win the competition. Then at Hallowe'en, when the Goblet of Fire makes its selection, Harry is amazed to find his name is one of those that the magical cup picks out. He will face death-defying tasks, dragons and Dark wizards, but with the help of his best friends, Ron and Hermione, he might just make it through - alive!",
      },
      {
        title: 'Harry Potter and the Order of the Phoenix',
        price: 12,
        countPage: 877,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791620344/HarryPotterAndTheOrderOfThePhoenix_vvo2sc.jpg',
        description:
          "Dark times have come to Hogwarts. After the Dementors' attack on his cousin Dudley, Harry Potter knows that Voldemort will stop at nothing to find him. There are many who deny the Dark Lord's return, but Harry is not alone: a secret order gathers at Grimmauld Place to fight against the Dark forces. Harry must allow Professor Snape to teach him how to protect himself from Voldemort's savage assaults on his mind. But they are growing stronger by the day and Harry is running out of time ...",
      },
      {
        title: 'Harry Potter and the Half-Blood Prince',
        price: 12,
        countPage: 652,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791620486/HarryPotterAndTheHalfBloodPrince_q9ljce.jpg',
        description:
          "When Dumbledore arrives at Privet Drive one summer night to collect Harry Potter, his wand hand is blackened and shrivelled, but he does not reveal why. Secrets and suspicion are spreading through the wizarding world, and Hogwarts itself is not safe. Harry is convinced that Malfoy bears the Dark Mark: there is a Death Eater amongst them. Harry will need powerful magic and true friends as he explores Voldemort's darkest secrets, and Dumbledore prepares him to face his destiny...",
      },
      {
        title: 'Harry Potter and the Deathly Hallows',
        price: 12,
        countPage: 766,
        genre: Genre.Fantasy,
        publicYear: '2015-12-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791620606/HarryPotterAndTheDeathlyHallows_qeod19.jpg',
        description:
          "As he climbs into the sidecar of Hagrid's motorbike and takes to the skies, leaving Privet Drive for the last time, Harry Potter knows that Lord Voldemort and the Death Eaters are not far behind. The protective charm that has kept Harry safe until now is broken, but he cannot keep hiding. The Dark Lord is breathing fear into everything Harry loves and to stop him Harry will have to find and destroy the remaining Horcruxes. The final battle must begin - Harry must stand and face his enemy...",
      },
    ],
  },
  {
    firstName: 'Dan',
    lastName: 'Brown',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791314989/Dan_Brown_r82zjb.jpg',
    biography:
      "Dan Brown is the author of eight #1 bestselling novels, including The Da Vinci Code, which has become one of the bestselling novels of all time as well as the subject of intellectual debate among readers and scholars. Brown's novels are published in 56 languages around the world with over 250 million copies in print.",
    books: [
      {
        title: 'The Da Vinci Code',
        price: 10,
        countPage: 496,
        genre: Genre.Mystery,
        publicYear: '2003-03-18',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791621110/TheDaVinceCode_zudv26.jpg',
        description:
          'While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum, his body covered in baffling symbols. As Langdon and gifted French cryptologist Sophie Neveu sort through the bizarre riddles, they are stunned to discover a trail of clues hidden in the works of Leonardo da Vinci—clues visible for all to see and yet ingeniously disguised by the painter.',
      },
      {
        title: 'Angels & Demons',
        price: 9,
        countPage: 736,
        genre: Genre.Mystery,
        publicYear: '2005-05-03',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791621260/AngelsDemons_knrsog.jpg',
        description:
          'An ancient secret brotherhood. A devastating new weapon of destruction. An unthinkable target. When world-renowned Harvard symbologist Robert Langdon is summoned to his first assignment to a Swiss research facility to analyze a mysterious symbol—seared into the chest of a murdered physicist—he discovers evidence of the unimaginable: the resurgence of an ancient secret brotherhood known as the Illuminati...the most powerful underground organization ever to walk the earth. The Illuminati has now surfaced to carry out the final phase of its legendary vendetta against its most hated enemy—the Catholic Church.',
      },
      {
        title: 'The Lost Symbol',
        price: 19,
        countPage: 658,
        genre: Genre.Mystery,
        publicYear: '2009-09-15',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791621419/TheLostSymbol_b8msj4.jpg',
        description:
          'Famed Harvard symbologist Robert Langdon answers an unexpected summons to deliver a lecture at the U.S. Capitol Building. His plans are interrupted when a disturbing object—artfully encoded with five symbols—is discovered in the building. Langdon recognizes in the find an ancient invitation into a lost world of esoteric, potentially dangerous wisdom.',
      },
      {
        title: 'Inferno',
        price: 18,
        countPage: 578,
        genre: Genre.Mystery,
        publicYear: '2013-05-14',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791621550/Inferno_shirng.jpg',
        description:
          'Harvard professor of symbology Robert Langdon awakens in an Italian hospital, disoriented and with no recollection of the past thirty-six hours, including the origin of the macabre object hidden in his belongings. With a relentless female assassin trailing them through Florence, he and his resourceful doctor, Sienna Brooks, are forced to flee.',
      },
      {
        title: 'Deception Point',
        price: 9,
        countPage: 464,
        genre: Genre.Mystery,
        publicYear: '2013-05-14',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791621664/DeceptionPoint_gsg1zp.jpg',
        description:
          'When a NASA satellite discovers an astonishingly rare object buried deep in the Arctic ice, the floundering space agency proclaims a much-needed victory -- a victory with profound implications for NASA policy and the impending presidential election. To verify the authenticity of the find, the White House calls upon the skills of intelligence analyst Rachel Sexton. Accompanied by a team of experts, including the charismatic scholar Michael Tolland, Rachel travels to the Arctic and uncovers the unthinkable: evidence of scientific trickery -- a bold deception that threatens to plunge the world into controversy. But before she can warn the President, Rachel and Michael are ambushed by a deadly team of assassins. Fleeing for their lives across a desolate and lethal landscape, their only hope for survival is to discover who is behind this masterful plot. The truth, they will learn, is the most shocking deception of all.',
      },
    ],
  },
  {
    firstName: 'Stephenie',
    lastName: 'Meyer',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791314990/StephenieMeyer_ywfwrf.jpg',
    biography:
      'American novelist known for her vampire romance series which became a global phenomenon.',
    books: [
      {
        title: 'Twilight',
        price: 11,
        countPage: 407,
        genre: Genre.RomanceNovel,
        publicYear: '2007-07-18',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791315062/Twilight_vp92ki.jpg',
        description:
          "Isabella Swan's move to Forks—a small, perpetually rainy town in Washington—could have been the most boring move she ever made. But once she meets the mysterious and alluring Edward Cullen, Bella's life takes a thrilling and terrifying turn. So far, Edward has managed to keep his vampire identity a secret in the small community he lives in, but now nobody is safe, especially Isabella, the person Edward holds most dear. The lovers find themselves balanced precariously on the point of a knife—between desire and danger.",
      },
      {
        title: 'New Moon',
        price: 17,
        countPage: 449,
        genre: Genre.RomanceNovel,
        publicYear: '2007-08-08',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791622515/NewMoon_phvmmf.jpg',
        description:
          'For Bella Swan, there is one thing more important than life itself: Edward Cullen. But being in love with a vampire is even more dangerous than Bella could ever have imagined. Edward has already rescued Bella from the clutches of one evil vampire, but now, as their daring relationship threatens all that is near and dear to them, they realize their troubles may be just beginning.',
      },
      {
        title: 'Eclipse',
        price: 16,
        countPage: 518,
        genre: Genre.RomanceNovel,
        publicYear: '2007-08-07',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791622992/Eclipse_pajbfz.jpg',
        description:
          'The steamy love triangle heats up in the third book of The Twilight Saga, as Bella must choose between her friendship with Jacob and her romance with Edward—a decision that could change the fate of vampires and werewolves forever. As Seattle is ravaged by a string of mysterious killings and a malicious vampire continues her quest for revenge, Bella once again finds herself surrounded by danger. ',
      },
    ],
  },
  {
    firstName: 'Suzanne',
    lastName: 'Collins',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791623319/SuzanneCollins_dq36sx.jpg',
    biography:
      "Suzanne Collins has had a successful and prolific career writing for children's television. She has worked on the staffs of several Nickelodeon shows, including the Emmy-nominated hit Clarissa Explains It All and The Mystery Files of Shelby Woo. Collins made her mark in children's literature with the New York Times bestselling five-book series for middle-grade readers The Underland Chronicles, which has received numerous accolades in both the United States and abroad. In the award-winning The Hunger Games trilogy, Collins continues to explore the effects of war and violence on those coming of age. Collins lives with her family in Connecticut.",
    books: [
      {
        title: 'The Hunger Games',
        price: 14,
        countPage: 387,
        genre: Genre.Fantasy,
        publicYear: '2009-09-01',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791623786/TheHungerGames_ts1jw8.jpg',
        description:
          "In the ruins of a place once known as North America lies the nation of Panem, a shining Capitol surrounded by twelve outlying districts. The Capitol keeps the districts in line by forcing them all to send one boy and one girl between the ages of twelve and eighteen to participate in the annual Hunger Games, a fight to the death on live TV.Sixteen-year-old Katniss Everdeen regards it as a death sentence when she steps forward to take her sister's place in the Games. But Katniss has been close to death before-and survival, for her, is second nature. Still, if she is to win, she will have to start making choices that weigh survival against humanity and life against love.",
      },
      {
        title: 'Catching Fire',
        price: 15,
        countPage: 367,
        genre: Genre.Fantasy,
        publicYear: '2010-03-28',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791623933/CatcjingFire_x3viuv.jpg',
        description:
          'Against all odds, Katniss Everdeen has won the annual Hunger Games with fellow district tribute Peeta Mellark. But it was a victory won by defiance of the Capitol and their harsh rules. Katniss and Peeta should be happy. After all, they have just won for themselves and their families a life of safety and plenty. But there are rumors of rebellion among the subjects, and Katniss and Peeta, to their horror, are the faces of that rebellion. The Capitol is angry. The Capitol wants revenge.',
      },
      {
        title: 'Mockingjay',
        price: 10,
        countPage: 404,
        genre: Genre.Fantasy,
        publicYear: '2010-08-24',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791624058/Mockingjay_afcbkq.jpg',
        description:
          'The Capitol is angry. The Capitol wants revenge. Who do they think should pay for the unrest? Katniss Everdeen. The final book in The Hunger Games trilogy by Suzanne Collins will have hearts racing, pages turning, and everyone talking about one of the biggest and most talked-about books and authors in recent publishing history!',
      },
    ],
  },
  {
    firstName: 'Guillem',
    lastName: 'Balagué',
    imageUrl:
      'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791624411/GuillemBalague_bqaeub.jpg',
    biography:
      "Guillem Balague is the author of Messi, Barça, Pep Guardiola, A Season on the Brink, and Cristiano Ronaldo. A key fixture of Sky Sports' coverage of Spanish football, he appears regularly both on live match coverage and on the weekly round-up show, Revista de la Liga. He is also the UK Correspondent for AS, the Madrid-based Spanish sports newspaper, and El Larguero, Spain's most popular sports radio show. His work appears regularly in The Times and in Champions magazine, where he writes a regular column on international football. ",
    books: [
      {
        title: 'Cristiano Ronaldo',
        price: 15,
        countPage: 496,
        genre: Genre.Biography,
        publicYear: '2015-11-05',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791624573/CristianoRonaldo_fvrxrd.jpg',
        description:
          "In this compelling account, Guillem Balagué draws on impeccable sources, first-hand interviews and unprecedented access, taking us on a journey from Madeira to Manchester, and onto Spain, Italy and Saudi Arabia. From Ronaldo's tutelage under Sir Alex Ferguson to becoming the biggest galáctico of them all at Real Madrid, and captaining Portugal to the first silverware in their history at the UEFA Euro 2016, Guillem chronicles Ronaldo's career in its entirety.",
      },
      {
        title: 'Messi',
        price: 12,
        countPage: 640,
        genre: Genre.Biography,
        publicYear: '2014-03-01',
        imageUrl:
          'https://res.cloudinary.com/dpaemdwqa/image/upload/v1791624802/Messi_l2ijco.jpg',
        description:
          'On May 1, 2005, 17-year-old Lionel Messi scored his first goal for FC Barcelona, becoming, at the time, the youngest player ever to score in a league match for the Catalan club. Since then, his story has been one of meteoric—and seemingly limitless—success. Now, this compelling and perceptive biography by respected soccer journalist Guillem Balague gets to the heart of the mystery and genius that is Messi.',
      },
    ],
  },
];

const users: SeedUser[] = [
  {
    email: 'admin@gmail.com',
    password: '123456',
    displayName: 'Admin',
    role: UserRole.ADMIN,
  },
  {
    email: 'regular@gmail.com',
    password: '123456',
    displayName: 'Regular',
    role: UserRole.REGULAR,
  },
  {
    email: 'test@gmail.com',
    password: '123456',
    displayName: 'Regular',
    role: UserRole.REGULAR,
  },
];

async function main() {
  console.log('Start seeding...');
  let authorsCreated = 0;
  let booksCreated = 0;
  let imagesUpdated = 0;
  let usersCreated = 0;

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
    } else if (!author.imageUrl && authorData.imageUrl) {
      await prisma.author.update({
        where: { id: author.id },
        data: { imageUrl: authorData.imageUrl },
      });
      imagesUpdated++;
    }

    for (const book of books) {
      const exists = await prisma.book.findFirst({
        where: { title: book.title, authorId: author.id },
      });

      if (!exists) {
        await prisma.book.create({
          data: {
            ...book,
            publicYear: new Date(book.publicYear),
            authorId: author.id,
          },
        });
        booksCreated++;
      } else if (!exists.imageUrl && book.imageUrl) {
        await prisma.book.update({
          where: { id: exists.id },
          data: { imageUrl: book.imageUrl },
        });
        imagesUpdated++;
      }
    }
  }

  for (const user of users) {
    const exists = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({ data: { ...user, password: hashedPassword } });
      console.log(hashedPassword);
      usersCreated++;
    }
  }

  console.log(
    `Seed завершено: авторів ${authorsCreated}, книг ${booksCreated}, фото оновлено ${imagesUpdated}, користувачів створено ${usersCreated}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
