const translitMap = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'j',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: 'j',
    ы: 'i',
    ь: 'j',
    э: 'e',
    ю: 'yu',
    я: 'ya',
}

export const toTranslit = (word: string) => {
    let translit: string = ''
    for (const letter of word.toLocaleLowerCase())
        translit += translitMap[letter] ? translitMap[letter] : letter
    return translit.split(/\s+/).join('-')
}

export const isLatinWithoutWhitespace = (word: string) =>
    word.split(/[^a-z-]|\s+/g).length !== 1 ? false : true
