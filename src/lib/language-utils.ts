/**
 * Language detection utilities for music content
 */

export type SongLanguage = 'turkish' | 'english' | 'auto';

/**
 * Detects the language of a song based on title and artist
 */
export function detectSongLanguage(title: string, artist: string): SongLanguage {
  const text = `${title} ${artist}`.toLowerCase();
  
  console.log(`🔍 Dil tespiti: "${title}" - "${artist}"`);
  
  // Türkçe karakterler ve kelimeler
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  const turkishWords = ['ve', 'bir', 'bu', 'şu', 'ile', 'için', 'gibi', 'kadar', 'sonra', 'önce', 'aşk', 'sevgi', 'hayat', 'dünya', 'gece', 'gündüz', 'yıldız', 'ay', 'güneş', 'deniz', 'dağ', 'şehir', 've', 'da', 'de', 'ki', 'mi', 'mu', 'mı', 'mü', 'bana', 'sana', 'ona', 'beni', 'seni', 'onu', 'gel', 'git', 'kal', 'dur', 'yap', 'et', 'ol', 'var', 'yok', 'çok', 'az', 'büyük', 'küçük', 'güzel', 'çirkin', 'iyi', 'kötü'];
  const turkishArtists = ['sezen aksu', 'tarkan', 'ajda pekkan', 'barış manço', 'cem karaca', 'zeki müren', 'müslüm gürses', 'ibrahim tatlıses', 'orhan gencebay', 'neşet ertaş', 'aşık veysel', 'ceza', 'sagopa kajmer', 'ezhel', 'khontkar', 'ben fero', 'reynmen', 'murda', 'uzi', 'norm ender', 'joker', 'defkhan', 'anıl piyancı', 'şehinşah', 'allame', 'hadise', 'demet akalın', 'ebru gündeş', 'sibel can', 'bülent ersoy', 'zara', 'simge', 'aleyna tilki', 'berkay', 'murat boz', 'mustafa ceceli', 'emrah', 'ferhat göçer', 'özcan deniz', 'buray', 'kenan doğulu', 'gökhan özen', 'zeynep bastık', 'deha bilimlier', 'eypio', 'yener çevik', 'ismail yk', 'ufuk çalışkan'];
  
  // İngilizce kelimeler ve sanatçılar
  const englishWords = ['the', 'and', 'you', 'love', 'me', 'my', 'your', 'with', 'for', 'like', 'time', 'life', 'night', 'day', 'heart', 'baby', 'girl', 'boy', 'man', 'woman', 'world', 'home', 'way', 'know', 'want', 'need', 'feel', 'make', 'take', 'come', 'go', 'see', 'get', 'give', 'tell', 'say', 'think', 'look', 'find', 'work', 'play', 'music', 'song', 'dance', 'party', 'money', 'dream', 'hope', 'happy', 'sad', 'good', 'bad', 'new', 'old', 'big', 'small', 'game', 'wicked', 'never', 'always', 'sometimes', 'maybe', 'please', 'thank', 'sorry', 'hello', 'goodbye', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'this', 'that', 'these', 'those', 'here', 'there', 'now', 'then', 'today', 'tomorrow', 'yesterday', 'morning', 'evening', 'night', 'light', 'dark', 'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray'];
  const englishArtists = ['ed sheeran', 'the weeknd', 'billie eilish', 'adele', 'harry styles', 'chris isaak', 'johnny cash', 'elvis presley', 'beatles', 'rolling stones', 'queen', 'david bowie', 'madonna', 'michael jackson', 'prince', 'whitney houston', 'mariah carey', 'celine dion', 'alanis morissette', 'radiohead', 'coldplay', 'u2', 'nirvana', 'pearl jam', 'red hot chili peppers', 'green day', 'linkin park', 'eminem', 'jay-z', 'kanye west', 'drake', 'rihanna', 'beyonce', 'taylor swift', 'ariana grande', 'justin bieber', 'selena gomez', 'dua lipa', 'the chainsmokers', 'calvin harris'];
  
  // Türkçe karakter kontrolü - güçlü gösterge
  if (turkishChars.test(text)) {
    console.log(`🇹🇷 Türkçe karakter bulundu: ${text.match(turkishChars)}`);
    return 'turkish';
  }
  
  // İngilizce sanatçı kontrolü - güçlü gösterge
  if (englishArtists.some(artist => text.includes(artist))) {
    const foundArtist = englishArtists.find(artist => text.includes(artist));
    console.log(`🇺🇸 İngilizce sanatçı bulundu: ${foundArtist}`);
    return 'english';
  }
  
  // Türkçe sanatçı kontrolü - güçlü gösterge
  if (turkishArtists.some(artist => text.includes(artist))) {
    const foundArtist = turkishArtists.find(artist => text.includes(artist));
    console.log(`🇹🇷 Türkçe sanatçı bulundu: ${foundArtist}`);
    return 'turkish';
  }
  
  // Kelime analizi
  const words = text.split(/\s+/);
  let turkishScore = 0;
  let englishScore = 0;
  
  words.forEach(word => {
    if (turkishWords.includes(word)) {
      turkishScore++;
      console.log(`🇹🇷 Türkçe kelime: ${word}`);
    }
    if (englishWords.includes(word)) {
      englishScore++;
      console.log(`🇺🇸 İngilizce kelime: ${word}`);
    }
  });
  
  // Özel kelime kalıpları
  if (text.includes('feat') || text.includes('ft.') || text.includes('featuring')) {
    englishScore += 2;
    console.log(`🇺🇸 İngilizce kalıp: feat/ft`);
  }
  if (text.includes('ile') || text.includes('ve')) {
    turkishScore += 2;
    console.log(`🇹🇷 Türkçe kalıp: ile/ve`);
  }
  
  console.log(`📊 Skor: Türkçe=${turkishScore}, İngilizce=${englishScore}`);
  
  // Sonuç
  if (turkishScore > englishScore) {
    console.log(`🇹🇷 Sonuç: turkish (${turkishScore} > ${englishScore})`);
    return 'turkish';
  } else if (englishScore > turkishScore) {
    console.log(`🇺🇸 Sonuç: english (${englishScore} > ${turkishScore})`);
    return 'english';
  } else {
    // Eşitlik durumunda, şarkı adına göre karar ver
    const titleWords = title.toLowerCase().split(/\s+/);
    const hasEnglishTitle = titleWords.some(word => englishWords.includes(word));
    
    if (hasEnglishTitle) {
      console.log(`🇺🇸 Sonuç: english (başlıkta İngilizce kelime)`);
      return 'english';
    } else {
      console.log(`🇹🇷 Sonuç: turkish (varsayılan)`);
      return 'turkish';
    }
  }
}

/**
 * Filters songs by language preference
 */
export function filterSongsByLanguage(songs: any[], currentLanguage: SongLanguage): any[] {
  console.log(`🔍 filterSongsByLanguage çağrıldı: ${songs.length} şarkı, hedef dil: ${currentLanguage}`);
  
  if (currentLanguage === 'auto' || !songs.length) {
    console.log('🔄 Auto mod veya boş liste - filtreleme yapılmıyor');
    return songs;
  }
  
  const filtered = songs.filter(song => {
    // Eğer şarkının dil bilgisi varsa onu kullan
    if (song.language && song.language !== 'auto') {
      const match = song.language === currentLanguage;
      console.log(`📝 "${song.title}" - Kayıtlı dil: ${song.language}, Hedef: ${currentLanguage}, Eşleşme: ${match}`);
      return match;
    }
    
    // Yoksa dil tespiti yap
    const detectedLanguage = detectSongLanguage(song.title, song.artist);
    const match = detectedLanguage === currentLanguage;
    console.log(`🔍 "${song.title}" - Tespit edilen dil: ${detectedLanguage}, Hedef: ${currentLanguage}, Eşleşme: ${match}`);
    return match;
  });
  
  console.log(`✅ Filtreleme sonucu: ${filtered.length}/${songs.length} şarkı`);
  return filtered;
}

/**
 * Gets language-based search keywords
 */
export function getLanguageSearchKeywords(language: SongLanguage, artist?: string): string[] {
  if (language === 'turkish') {
    const turkishKeywords = [
      'türkçe müzik',
      'turkish music',
      'türkçe pop',
      'türkçe rock',
      'türkçe rap',
      'türkçe şarkılar',
      'türk müziği'
    ];
    
    if (artist) {
      turkishKeywords.push(artist, `${artist} türkçe`);
    }
    
    return turkishKeywords;
  } else {
    const englishKeywords = [
      'english music',
      'pop music',
      'rock music',
      'hip hop',
      'english songs',
      'top hits',
      'billboard'
    ];
    
    if (artist) {
      englishKeywords.push(artist, `${artist} english`);
    }
    
    return englishKeywords;
  }
}