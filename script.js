document.addEventListener('DOMContentLoaded', function() {

    // === SAYFA VE MODAL ELEMENTLERİ ===
    const navLinkElements = document.querySelectorAll('.nav-link');
    const sayfalar = document.querySelectorAll('.sayfa');
    const projeModal = document.getElementById('proje-modal');
    const demoModal = document.getElementById('demo-modal');
    const modals = [projeModal, demoModal];

    // === ATATÜRK VE HİTABE ELEMENTLERİ ===
    const ataturkGif = document.getElementById('ataturkGif');
    const hitabeContainer = document.getElementById('hitabeContainer');

    // === SAYFA VE PENCERE KONTROLLERİ ===
    navLinkElements.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            sayfalar.forEach(s => s.classList.remove('aktif'));
            document.getElementById(targetId).classList.add('aktif');
            hitabeContainer.classList.remove('aktif');
        });
    });
    
    if (ataturkGif) {
        ataturkGif.addEventListener('click', () => {
            hitabeContainer.classList.toggle('aktif');
        });
    }

    modals.forEach(modal => {
        if (modal) {
            modal.querySelector('.close-button').onclick = () => modal.style.display = "none";
        }
    });

    window.onclick = event => {
        modals.forEach(modal => {
            if (event.target == modal) modal.style.display = "none";
        });
        if (event.target == hitabeContainer) hitabeContainer.classList.remove('aktif');
    };
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modals.forEach(modal => { if(modal) modal.style.display = 'none' });
            if(hitabeContainer) hitabeContainer.classList.remove('aktif');
        }
    });

    // === AKSİYON BUTONLARI İÇİN EVENT LISTENER ===
    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.btn-goster')) {
            const wrapper = event.target.closest('.kod-blogu-wrapper');
            const kodBlok = wrapper.querySelector('.kod-blogu');
            kodBlok.classList.toggle('acik');
            event.target.textContent = kodBlok.classList.contains('acik') ? 'Kodu Gizle' : 'Kodu Göster';
        }

        if (event.target.matches('.btn-kopyala')) {
            const wrapper = event.target.closest('.kod-blogu');
            const kod = wrapper.querySelector('code').innerText;
            navigator.clipboard.writeText(kod).then(() => {
                event.target.classList.add('kopyalandi');
                setTimeout(() => event.target.classList.remove('kopyalandi'), 1500);
            });
        }

        if (event.target.matches('.btn-demo')) {
            const kodId = event.target.dataset.id;
            const kodData = tumVeri.kodlar.find(k => k.id === kodId);
            if (kodData) demoyuBaslat(kodData);
        }
    });

    // === VERİLERİ YÜKLE VE SAYFAYI OLUŞTUR ===
    let tumVeri = {};
    async function verileriYukle() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            tumVeri = await response.json();

            const projelerListesi = document.getElementById('projeler-listesi');
            if(projelerListesi) {
                projelerListesi.innerHTML = '';
                tumVeri.projeler.forEach(proje => {
                    const projeElementi = document.createElement('div');
                    projeElementi.className = 'proje-karti';
                    projeElementi.dataset.id = proje.id;
                    const kapakResmi = proje.resimler && proje.resimler.length > 0 ? proje.resimler[0] : 'images/default.png';
                    projeElementi.innerHTML = `<img src="${kapakResmi}" alt="${proje.baslik}"><div class="proje-karti-icerik"><h3>${proje.baslik}</h3><p>${proje.aciklama}</p></div>`;
                    projeElementi.addEventListener('click', () => detaylariGoster(proje));
                    projelerListesi.appendChild(projeElementi);
                });
            }

            const kodlarListesi = document.getElementById('kodlar-listesi');
            if(kodlarListesi){
                kodlarListesi.innerHTML = '';
                tumVeri.kodlar.forEach(kod => {
                    const element = document.createElement('div');
                    let demoButton = kod.demo ? `<button class="btn btn-demo" data-id="${kod.id}">⚡ Demoyu Dene</button>` : '';

                    if (kod.tip === 'indir') {
                        element.className = 'indir-karti';
                        element.innerHTML = `<h3>${kod.baslik}</h3><p>${kod.aciklama}</p><a href="${kod.dosyaYolu}" class="btn" download>İndir</a>`;
                    } else {
                        element.className = 'kod-karti';
                        const guvenliKod = kod.kod.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        element.innerHTML = `
                            <h3>${kod.baslik}</h3>
                            <p>${kod.aciklama}</p>
                            <div class="kod-blogu-wrapper">
                                <div class="kod-actions">
                                    <button class="btn btn-goster">Kodu Göster</button>
                                    ${demoButton}
                                </div>
                                <div class="kod-blogu">
                                    <button class="btn btn-kopyala">📋</button>
                                    <pre><code>${guvenliKod}</code></pre>
                                </div>
                            </div>`;
                    }
                    kodlarListesi.appendChild(element);
                });
            }

        } catch (error) { console.error('Veri Yüklenemedi:', error); }
    }

    function detaylariGoster(proje) {
        document.getElementById('modal-title').textContent = proje.baslik;
        const imagesContainer = document.getElementById('modal-images');
        imagesContainer.innerHTML = '';
        proje.resimler.forEach(resimUrl => {
            imagesContainer.innerHTML += `<img src="${resimUrl}" alt="${proje.baslik} resmi">`;
        });
        const materialsContainer = document.getElementById('modal-materials');
        materialsContainer.innerHTML = '';
        proje.malzemeler.forEach(malzeme => {
            materialsContainer.innerHTML += `<li>${malzeme}</li>`;
        });
        const codesContainer = document.getElementById('modal-codes');
        codesContainer.innerHTML = '';
        proje.kodBloklari.forEach(blok => {
            const guvenliKod = blok.kod.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            codesContainer.innerHTML += `
            <div class="kod-blogu-wrapper">
                <h4>${blok.dil}</h4>
                <div class="kod-actions">
                    <button class="btn btn-goster">Kodu Göster</button>
                </div>
                <div class="kod-blogu">
                    <button class="btn btn-kopyala">📋</button>
                    <pre><code>${guvenliKod}</code></pre>
                </div>
            </div>`;
        });
        projeModal.style.display = "block";
    }

    function demoyuBaslat(kodData) {
        const title = document.getElementById('demo-modal-title');
        const content = document.getElementById('demo-modal-content');
        title.textContent = kodData.baslik;
        content.innerHTML = '';

        switch (kodData.id) {
            case 'python-sayi-tahmin':
                let sayi = Math.ceil(Math.random() * 100);
                content.innerHTML = `
                    <p>1 ile 100 arasında bir sayı tuttum. Hadi tahmin et!</p>
                    <input type="number" id="tahminInput" placeholder="Tahminin...">
                    <button id="tahminButton" class="btn">Tahmin Et</button>
                    <p id="tahminSonuc"></p>
                `;
                document.getElementById('tahminButton').addEventListener('click', () => {
                    const tahmin = parseInt(document.getElementById('tahminInput').value);
                    const sonuc = document.getElementById('tahminSonuc');
                    if (isNaN(tahmin)) {
                        sonuc.textContent = 'Lütfen geçerli bir sayı girin.';
                        return;
                    }
                    if (tahmin === sayi) {
                        sonuc.innerHTML = `🎉 Tebrikler, doğru tahmin! Sayı ${sayi} idi. Yeni oyun için pencereyi kapatıp tekrar aç.`;
                    } else if (tahmin > sayi) {
                        sonuc.textContent = 'Daha küçük bir sayı gir.';
                    } else {
                        sonuc.textContent = 'Daha büyük bir sayı gir.';
                    }
                });
                break;
            
            case 'python-tkm':
                content.innerHTML = `
                    <p>Seçimini yap: Taş mı, Kağıt mı, Makas mı?</p>
                    <button class="btn tkm-secim" data-secim="Taş">Taş</button>
                    <button class="btn tkm-secim" data-secim="Kağıt">Kağıt</button>
                    <button class="btn tkm-secim" data-secim="Makas">Makas</button>
                    <p id="tkmSonuc"></p>
                `;
                document.querySelectorAll('.tkm-secim').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const oyuncuSecimi = e.target.dataset.secim;
                        const secenekler = ["Taş", "Kağıt", "Makas"];
                        const bilgisayarSecimi = secenekler[Math.floor(Math.random() * 3)];
                        const sonuc = document.getElementById('tkmSonuc');
                        
                        let sonucText = `Senin seçimin: <strong>${oyuncuSecimi}</strong>, Bilgisayarın seçimi: <strong>${bilgisayarSecimi}</strong>.<br>`;
                        if (oyuncuSecimi === bilgisayarSecimi) {
                            sonucText += "Berabere!";
                        } else if (
                            (oyuncuSecimi === "Taş" && bilgisayarSecimi === "Makas") ||
                            (oyuncuSecimi === "Kağıt" && bilgisayarSecimi === "Taş") ||
                            (oyuncuSecimi === "Makas" && bilgisayarSecimi === "Kağıt")
                        ) {
                            sonucText += "Kazandın!";
                        } else {
                            sonucText += "Kaybettin!";
                        }
                        sonuc.innerHTML = sonucText;
                    });
                });
                break;

            case 'python-sifre-olusturucu':
                content.innerHTML = `
                    <p>Kaç karakterli bir şifre istersin?</p>
                    <input type="number" id="sifreUzunluk" value="12" min="4" max="32">
                    <button id="sifreButton" class="btn">Şifre Oluştur</button>
                    <p id="sifreSonuc"></p>
                `;
                document.getElementById('sifreButton').addEventListener('click', () => {
                    const uzunluk = parseInt(document.getElementById('sifreUzunluk').value);
                    const karakterler = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%&*?";
                    let sifre = '';
                    for (let i = 0; i < uzunluk; i++) {
                        sifre += karakterler.charAt(Math.floor(Math.random() * karakterler.length));
                    }
                    document.getElementById('sifreSonuc').textContent = `Oluşturulan Şifre: ${sifre}`;
                });
                break;

            case 'html-karanlik-mod':
                content.innerHTML = `<p>Aşağıdaki checkbox ile demo penceresinin temasını değiştirin.</p>
                <label style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
                    <input type="checkbox" id="themeCheckboxDemo"> Karanlık Mod
                </label>`;
                document.getElementById('themeCheckboxDemo').addEventListener("change", (e) => {
                    const modalContent = demoModal.querySelector('.modal-content');
                    modalContent.style.transition = 'background-color 0.3s, color 0.3s';
                    if(e.target.checked) {
                        modalContent.style.backgroundColor = 'var(--bg-color)';
                        modalContent.style.color = 'var(--text-color)';
                    } else {
                        modalContent.style.backgroundColor = '';
                        modalContent.style.color = '';
                    }
                });
                break;

            case 'python-sifreli-liste-yoneticisi':
                let demoSifre = null;
                let demoListe = [];
                content.innerHTML = `<div id="sifreKurulum">
                        <p>Lütfen demo için bir şifre belirleyin (sadece sayılar):</p>
                        <input type="number" id="sifreBelirleInput" placeholder="Şifre..."><button id="sifreBelirleBtn" class="btn">Ayarla</button>
                    </div>
                    <div id="listeYonetim" style="display:none;">
                         <p>İşlem Seçin:</p>
                         <input type="text" id="listeInput" placeholder="Eklenecek/Çıkarılacak öğe...">
                         <button class="btn" data-islem="ekle">Ekle</button>
                         <button class="btn btn-demo" data-islem="cikar">Çıkar</button>
                         <button class="btn" data-islem="goster">Göster</button>
                         <p id="listeSonuc"></p>
                    </div>`;
                document.getElementById('sifreBelirleBtn').onclick = () => {
                    const sifre = document.getElementById('sifreBelirleInput').value;
                    if(sifre) {
                        demoSifre = parseInt(sifre);
                        document.getElementById('sifreKurulum').style.display = 'none';
                        document.getElementById('listeYonetim').style.display = 'block';
                        document.getElementById('listeSonuc').textContent = 'Şifre ayarlandı. Artık işlem yapabilirsiniz.';
                    }
                };
                document.getElementById('listeYonetim').addEventListener('click', (e) => {
                    if(e.target.tagName !== 'BUTTON') return;
                    const girilenSifre = parseInt(prompt("Lütfen şifreyi girin:"));
                    if(girilenSifre !== demoSifre) { alert("Hatalı şifre!"); return; }
                    
                    const islem = e.target.dataset.islem;
                    const input = document.getElementById('listeInput');
                    const sonuc = document.getElementById('listeSonuc');
                    if(islem === 'ekle' && input.value) {
                        demoListe.push(input.value);
                        sonuc.textContent = `"${input.value}" eklendi. Liste: [${demoListe.join(', ')}]`;
                        input.value = '';
                    } else if (islem === 'cikar' && input.value) {
                        const index = demoListe.indexOf(input.value);
                        if(index > -1) {
                            demoListe.splice(index, 1);
                             sonuc.textContent = `"${input.value}" çıkarıldı. Liste: [${demoListe.join(', ')}]`;
                        } else {
                             sonuc.textContent = `"${input.value}" listede bulunamadı.`;
                        }
                        input.value = '';
                    } else if (islem === 'goster') {
                        sonuc.textContent = `Mevcut Liste: [${demoListe.join(', ')}]`;
                    }
                });
                break;
                
            case 'python-gelistirilmis-hesap-makinesi':
                content.innerHTML = `<input type="number" id="sayi1" placeholder="İlk sayı"><input type="number" id="sayi2" placeholder="İkinci sayı (gerekliyse)">
                    <div>
                        <button class="btn" data-op="topla">+</button> <button class="btn" data-op="cikar">-</button>
                        <button class="btn" data-op="carp">*</button> <button class="btn" data-op="bol">/</button>
                        <button class="btn" data-op="us">xʸ</button> <button class="btn" data-op="faktoriyel">n!</button>
                        <button class="btn" data-op="karekok">√x</button>
                    </div><p id="hesapSonuc" style="font-size: 1.2rem; margin-top: 1rem;"></p>`;
                content.querySelector('div').addEventListener('click', e => {
                    if(e.target.tagName !== 'BUTTON') return;
                    const op = e.target.dataset.op;
                    const s1Input = document.getElementById('sayi1');
                    const s2Input = document.getElementById('sayi2');
                    const s1 = parseFloat(s1Input.value);
                    const s2 = parseFloat(s2Input.value);
                    const sonucP = document.getElementById('hesapSonuc');
                    let sonuc;
                    
                    try {
                        if (['topla', 'cikar', 'carp', 'bol', 'us'].includes(op) && (isNaN(s1) || isNaN(s2))) throw new Error("İki sayı gerekli.");
                        if (['faktoriyel', 'karekok'].includes(op) && isNaN(s1)) throw new Error("İlk sayı gerekli.");

                        if(op === 'topla') sonuc = s1 + s2;
                        else if(op === 'cikar') sonuc = s1 - s2;
                        else if(op === 'carp') sonuc = s1 * s2;
                        else if(op === 'bol') {
                            if(s2 === 0) throw new Error("Sıfıra bölünemez!");
                            sonuc = s1 / s2;
                        }
                        else if(op === 'us') sonuc = Math.pow(s1, s2);
                        else if(op === 'faktoriyel') {
                            if (s1 < 0 || !Number.isInteger(s1)) throw new Error("Negatif veya ondalıklı sayıların faktöriyeli olmaz.");
                            let f = 1; for(let i=2; i<=s1; i++) f*=i; sonuc = f;
                        }
                        else if(op === 'karekok') {
                            if (s1 < 0) throw new Error("Negatif sayının karekökü alınamaz.");
                            sonuc = Math.sqrt(s1);
                        }
                        sonucP.textContent = `Sonuç: ${sonuc}`;
                    } catch (err) { sonucP.textContent = `Hata: ${err.message}`; }
                });
                break;
            
            case 'python-turtle-kalp':
                 content.innerHTML = `
                    <p>Python Turtle kodunun bir canlandırması:</p>
                    <canvas id="heartCanvas" width="300" height="300" style="background-color: white; border: 1px solid var(--primary-color); display: block; margin: 1rem auto 0;"></canvas>
                 `;
                 
                 const canvas = document.getElementById('heartCanvas');
                 const ctx = canvas.getContext('2d');
                 
                 ctx.clearRect(0, 0, canvas.width, canvas.height);

                 const x = canvas.width / 2;
                 const y = canvas.height / 2 - 20;
                 const size = 8;
                 
                 ctx.strokeStyle = 'red';
                 ctx.fillStyle = 'red';
                 ctx.lineWidth = 3;

                 ctx.beginPath();
                 ctx.moveTo(x, y + size * 4);
                 ctx.bezierCurveTo(x + size * 7, y - size * 2, x, y - size * 4, x, y);
                 ctx.moveTo(x, y + size * 4);
                 ctx.bezierCurveTo(x - size * 7, y - size * 2, x, y - size * 4, x, y);
                 
                 ctx.stroke();
                 ctx.fill();   
                 
                 break;
        }
        
        demoModal.style.display = 'block';
    }

    verileriYukle();
});