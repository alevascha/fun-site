// Source images per project, in CMS slot order:
// [hero, card/screenshot 1, card/screenshot 2, gallery 5, gallery 6, gallery 8]
// (framerusercontent ids, taken from the live project pages).
// `tall` lists slots whose source is portrait, so the crop starts at the top.
export const PROJECTS = [
  { slug: 'huntela', label: 'Huntela · Sales intelligence', accent: '#F2545B',
    images: ['AFa0Hd5NQQg01ggS0Z0NQwLQrYY.jpg', 'E0u4HeSoos7ek7yMsg4OuezHY.jpg', 'PH431C5nWHzfpjtlNm6ATheYk.jpg', 'Eqweh9woR3GurBPX9I9yeQQZ9A.jpg', 'oHmv5hZC2NyBqpA61aEUlt8fsxk.jpg', 'jO9BaxKMNLqr50ee3GPLbeOLuQ.jpg'] },
  { slug: 'sanza-energy', label: 'Sanza Energy · Web app', accent: '#2DB37A',
    images: ['lFQjBvchmDYZIIIXeDUveDagUk.jpg', 'rv6G8gvhw2uwoYaVfAsdoyaE0.jpg', 'ERb75pJ5A0MVMk0JY9oUMVSYmFI.jpg', 'HouNuno9BC3eANOd0cE3wrW6awA.jpg', 'qNGxJG96a6lKlFAoq4ranhLWP0.jpg', 'tqZQxOtQuc655Uc9SudMW95N5w.jpg'] },
  { slug: 'thors-training-app', label: "Thor's Training · White-label", accent: '#E8B931',
    images: ['8KUlLpZc9r1BfLo1olm6MINHBg8.jpg', 'cdWk3aXxOrDGGru20dpRQYddk.jpg', 'm3iDYX3LYrIeOajIFpI9DztM0.jpg', 'koIAleAzRlxD7nMzeSJHmWxsNQ.jpg', 'nYjdSnJVmMFTZfFVahhSJamo.jpg', '8KUlLpZc9r1BfLo1olm6MINHBg8.jpg'] },
  { slug: 'valora-medical-group---webflow-management', label: 'Valora Medical · Webflow', accent: '#3B82F6',
    images: ['Iukygk9sa4hHNYLvUxdclGMTNaA.png', 'TsGYaqbThM5jDDGRjXhrzYlJg.png', 'L7X4GtOid6KvC2UwytcrvEsmL4.png', 'sPuagZx9V5ghps5CT8bAwRtPB7Q.png', 'VnirMKixBCLu4Dd9SRsxCXd4rM.png', 'dxXYxeYDJuavskdFk1v74R5Wv7Q.png'], tall: [2] },
  { slug: 'mystrengthbook', label: 'MyStrengthBook · Design system', accent: '#0097B2', gradient: 'linear-gradient(90deg,#0097B2,#7ED957)',
    images: ['faFYmYudbOfDDNwvuYSl1owIY.png', 'IVfPFrjiWdTAyWWOxQCPGLuA.png', 'qhv6yjiLiQ9RVAj5MZVHdKGodeQ.png', '13c02meLZ7b5FiH470kTzvQcFSM.png', 'jKKrWjpyrJb9iDvSwxex3tZxLQM.png', 'MlTQNt79H4qh490ndbjKTTT58.png'], tall: [2] },
  { slug: 'dollar-general', label: 'Dollar General · Design system', accent: '#FFE600',
    images: ['qTY15BbPgNH431BRE4hGW9GJK2w.png', 'LDLcMJoDtsL8go71Zgzr73D0ig.png', 'DCnbXL42odmKfIqEybsr6wcARk.png', '3NP47C37eQlSuajVncLLFFfJp8M.png', 'budEpC6ozwt4bdUXmhSWAZfnr0.png', '85h8AbU4aqn6gjGyxSSlT0eEWQ.png'] },
  { slug: 'xlow-branding', label: 'xYlow · Brand identity', accent: '#6D5BFF',
    images: ['O5FxIBq2S1jdujEMED1vgWqjCo.png', 'sjHDcF5jMolA9hdgO6QDvTLb0E.png', 'uuyWINPHuseQ3q1C9j6gy9RVXSQ.png', 'R2bSAA6S4WfNrtVjuFCzHxr0tjg.png', 'AM5jQb0fssF5FNriTkHkSQa3BV0.png', 'j3iMBq40zSwG2KTmFj3V8IQ1e4.png'] },
  { slug: 'afp-modelo', label: 'AFP Modelo · Design system', accent: '#81BD00',
    images: ['JXZDaJHgnxgMB51KudKAo8Lr0p0.png', 'KTBYe9KBPWg5Ab9gzqsakNwXw.png', 'l4hvxtH2zARF85QOk9PuPD27bI.png', 'CXsBztR4cMb96pMs1hB83DCR1pQ.png', 'aJqupG1ZGUJZiKipsfLBsFssC4.png', 'lBAkNQrFT5MRHtpizz1N6UjtcDQ.png'], tall: [1] },
];
