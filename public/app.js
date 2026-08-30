let allProducts = [];
let activeCategory = 'Все';
let whatsappNumber = '';

const $ = (s) => document.querySelector(s);

function money(value) {
  return Number(value || 0).toLocaleString('ru-RU') + ' сомони';
}

function whatsappLink(product) {
  const text =
    'Здравствуйте! 🌸%0A' +
    'Хочу заказать букет «' + encodeURIComponent(product.name) + '».%0A' +
    'Цена: ' + encodeURIComponent(money(product.price)) + '.%0A' +
    'Подскажите, пожалуйста, как оформить заказ?';
  return 'https://wa.me/' + whatsappNumber + '?text=' + text;
}

function renderFilters() {
  const categories = ['Все', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  $('#filters').innerHTML = categories.map(c =>
    '<button class="filter ' + (c === activeCategory ? 'active' : '') + '" data-cat="' + c + '">' + c + '</button>'
  ).join('');

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const products = allProducts.filter(p => activeCategory === 'Все' || p.category === activeCategory);

  if (!products.length) {
    $('#productGrid').innerHTML = '<div class="loading">Пока нет букетов в этой категории.</div>';
    return;
  }

  $('#productGrid').innerHTML = products.map((p, i) => `
    <article class="product" style="animation-delay:${i * 60}ms" onclick="openProduct(${p.id})">
      <div class="product-photo">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="product-overlay">
          <span class="quick">Подробнее →</span>
          <span class="available ${p.available ? '' : 'sold'}">${p.available ? 'В наличии' : 'Нет в наличии'}</span>
        </div>
      </div>
      <div class="product-info">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <small>${escapeHtml(p.category)}</small>
        </div>
        <div class="price">${money(p.price)}</div>
      </div>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[c]));
}

function openProduct(id) {
  window.location.href = '/product.html?id=' + encodeURIComponent(id);
}

async function init() {
  try {
    const [configRes, productsRes] = await Promise.all([
      fetch('/api/config'),
      fetch('/api/products')
    ]);

    const config = await configRes.json();
    allProducts = await productsRes.json();
    whatsappNumber = config.whatsapp;

    const generalLink = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('Здравствуйте! Хочу узнать подробнее о букетах магазина Ромашка 🌸');
    $('#phoneLink').href = generalLink;
    $('#heroWhatsApp').href = generalLink;
    $('#ctaWhatsApp').href = generalLink;

    renderFilters();
    renderProducts();
  } catch (e) {
    $('#productGrid').innerHTML = '<div class="loading">Не удалось загрузить каталог. Проверьте сервер.</div>';
  }
}

init();
