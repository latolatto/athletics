/* Checkout script with improved PDF images + centered header
   - product images maintain aspect ratio and are centered in table cells
   - business logo + support contacts centered in PDF header
   - modal closes only with Close button (no backdrop click)
*/
window.formDisabled = false;
let paypalRendered = false;

document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIG: change if you have a specific logo URL ---
  const businessLogo = './images/icons/mainlogo-nobg.png'; // set to your logo (CORS must allow)
  // const businessName = 'Athletics';
  const businessPhone = '+355698136849';
  const businessEmail = 'info@shopathletics.store';

  // --- DOM refs ---
  const cartItemsDiv = document.getElementById('cartItems');
  const subtotalDiv = document.getElementById('subtotal');
  const shippingDiv = document.getElementById('shipping-cost');
  const grandTotalDiv = document.getElementById('grand-total');
  const cartBadge = document.getElementById('cartBadge');

  const countrySelect = document.getElementById('country');
  const codRadio = document.getElementById('cod');
  const paypalRadio = document.getElementById('credit');
  const submitBtnDiv = document.querySelector('.submit-btn-div');
  const paypalContainer = document.getElementById('paypal-button-container');
  const form = document.getElementById('form');
  const result = document.getElementById('result');

  // modal refs (must exist)
  const backdrop = document.getElementById('order-confirm-backdrop');
  const modalEl = document.getElementById('order-confirm-modal');

  const itemsCol = document.getElementById('order-items-col');
  const summaryBox = document.getElementById('order-summary-box');
  const btnClose = document.getElementById('order-close-btn');
  const btnDownload = document.getElementById('order-download-btn');
  const downloadCheck = document.getElementById('order-download-check');


  modalEl.scrollTop = 0;
  // required fields (ids)
  const requiredFieldIds = ['firstName','lastName','email','phone-number','country','city','address','zip'];

  // --- regex validators ---
  const reNameCity = /^[A-Za-zÀ-ž]{2,}(?:\s[A-Za-zÀ-ž]{2,}){0,2}$/;
  const rePhoneE164 = /^\+[1-9]\d{7,14}$/;
  const reZip = /^\d{3,10}$/;
  const reAddress = /^[A-Za-z0-9À-ž\s\.,#\-\/]{5,}$/;

  /* helpers */
  function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || JSON.parse(sessionStorage.getItem('cart')) || []; } catch(e){ return []; }
  }

  function renderCart() {
    const cart = getCart();
    if (!cart || cart.length === 0) {
      cartBadge && (cartBadge.textContent = '0');
      cartItemsDiv && (cartItemsDiv.innerHTML = '');
      subtotalDiv && (subtotalDiv.innerHTML = '');
      shippingDiv && (shippingDiv.innerHTML = '');
      grandTotalDiv && (grandTotalDiv.innerHTML = '');
      return;
    }
    const shipping = 300;
    let subtotal = 0;
    let totalItems = 0;
    cartItemsDiv.innerHTML = '';
    cart.forEach(item => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const totalPrice = price * qty;
      subtotal += totalPrice;
      totalItems += qty;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-items';
      itemDiv.innerHTML = `
        <img class="item-image" src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.title || item.name || '')}">
        <div class="cart-items-details">
          <div class="item-title"><p>${escapeHtml(item.title || item.name || '')}</p></div>
          <div class="item-quantity"><p>Quantity: ${qty}</p></div>
          <div class="item-price"><p>${totalPrice.toFixed(2)} ALL</p></div>
        </div>`;
      cartItemsDiv.appendChild(itemDiv);
    });
    const grandtotal = subtotal + shipping;
    cartBadge && (cartBadge.textContent = totalItems);
    subtotalDiv && (subtotalDiv.innerHTML = `Subtotal: ${subtotal.toFixed(2)} ALL`);
    shippingDiv && (shippingDiv.innerHTML = `Shipping : ${shipping.toFixed(2)} ALL`);
    grandTotalDiv && (grandTotalDiv.innerHTML = `<strong>Grand Total:</strong>  ${grandtotal.toFixed(2)} ALL`);
  }

  function getGrandTotalAmount() {
    const el = document.querySelector('#grand-total');
    if (!el) return 0;
    const text = (el.innerText || el.textContent || '').replace(/\u00A0/g,' ').replace(',', '.');
    const match = text.match(/([\d]+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  function getShippingAmount() {
    const el = document.querySelector('#shipping-cost');
    if (!el) return 0;
    const text = (el.innerText || el.textContent || '').replace(/\u00A0/g,' ').replace(',', '.');
    const match = text.match(/([\d]+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // validation
  function validateAllFields() {
    const res = { valid: true, errors: {}, firstInvalidId: null };
    const first = document.getElementById('firstName');
    if (!first || !first.value.trim() || !reNameCity.test(first.value.trim())) { res.valid=false; res.errors['firstName']='First name: only letters, 1–3 words.'; if (!res.firstInvalidId) res.firstInvalidId='firstName'; }
    const last = document.getElementById('lastName');
    if (!last || !last.value.trim() || !reNameCity.test(last.value.trim())) { res.valid=false; res.errors['lastName']='Surname: only letters, 1–3 words.'; if (!res.firstInvalidId) res.firstInvalidId='lastName'; }
    const email = document.getElementById('email');
    if (!email || !email.value.trim()) { res.valid=false; res.errors['email']='Email is required.'; if (!res.firstInvalidId) res.firstInvalidId='email'; }
    else { const reEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!reEmail.test(email.value.trim())) { res.valid=false; res.errors['email']='Invalid email.'; if (!res.firstInvalidId) res.firstInvalidId='email'; } }
    const phone = document.getElementById('phone-number');
    if (!phone || !phone.value.trim() || !rePhoneE164.test(phone.value.trim())) { res.valid=false; res.errors['phone-number']='Phone must be E.164 (+355...).'; if (!res.firstInvalidId) res.firstInvalidId='phone-number'; }
    const country = document.getElementById('country');
    if (!country || !country.value.trim()) { res.valid=false; res.errors['country']='Select Country.'; if (!res.firstInvalidId) res.firstInvalidId='country'; }
    const city = document.getElementById('city');
    if (!city || !city.value.trim() || !reNameCity.test(city.value.trim())) { res.valid=false; res.errors['city']='City: only letters, 1–3 words.'; if (!res.firstInvalidId) res.firstInvalidId='city'; }
    const addr = document.getElementById('address');
    if (!addr || !addr.value.trim() || !reAddress.test(addr.value.trim())) { res.valid=false; res.errors['address']='Address: letters+numbers (min 5).'; if (!res.firstInvalidId) res.firstInvalidId='address'; }
    const zip = document.getElementById('zip');
    if (!zip || !zip.value.trim() || !reZip.test(zip.value.trim())) { res.valid=false; res.errors['zip']='Postal code: numbers (3–10).'; if (!res.firstInvalidId) res.firstInvalidId='zip'; }
    return res;
  }

  function setFieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    try { el.setCustomValidity(message || ''); } catch(e){}
    message ? el.classList.add('field-invalid') : el.classList.remove('field-invalid');
  }
  function applyValidationUI(result) {
    requiredFieldIds.forEach(id => setFieldError(id, ''));
    for (const id in result.errors) setFieldError(id, result.errors[id]);
  }

  // payflow / paypal
  function ensurePayPalStillAllowedOrFallback() {
    if (!paypalRadio || !paypalContainer) return;
    const paypalShown = paypalContainer.style.display !== 'none' && paypalContainer.offsetParent !== null;
    if (!paypalShown && !paypalRadio.checked) return;
    const v = validateAllFields();
    if (!v.valid) {
      try { alert('Some fields became invalid - returning to COD.'); } catch(e){}
      paypalRadio.checked = false;
      submitBtnDiv && (submitBtnDiv.style.display = 'block');
      paypalContainer && (paypalContainer.style.display = 'none');
      if (codRadio && !codRadio.disabled) codRadio.checked = true;
      applyValidationUI(v);
      if (v.firstInvalidId) document.getElementById(v.firstInvalidId)?.focus();
    } else applyValidationUI(v);
  }
  function showCODUI(){ if (submitBtnDiv) submitBtnDiv.style.display = 'block'; if (paypalContainer) paypalContainer.style.display = 'none'; }
  function showPayPalUI(){ if (submitBtnDiv) submitBtnDiv.style.display = 'none'; if (paypalContainer) paypalContainer.style.display = 'block'; }

  function updatePaymentOptionsFromCountry() {
    if (window.formDisabled) { codRadio && (codRadio.disabled=true); paypalRadio && (paypalRadio.disabled=true); submitBtnDiv && (submitBtnDiv.style.display='none'); paypalContainer && (paypalContainer.style.display='none'); return; }
    const cart = getCart();
    if (!cart || cart.length === 0) { codRadio && (codRadio.disabled=true,codRadio.checked=false); paypalRadio && (paypalRadio.disabled=true,paypalRadio.checked=false); submitBtnDiv && (submitBtnDiv.style.display='none'); paypalContainer && (paypalContainer.style.display='none'); return; }
    const selectedCountry = countrySelect ? (countrySelect.value||'').trim() : '';
    if (selectedCountry === 'Albania' || selectedCountry === 'Kosovo') { codRadio && (codRadio.disabled=false,codRadio.checked=true); paypalRadio && (paypalRadio.disabled=false); showCODUI(); }
    else if (selectedCountry !== '') { codRadio && (codRadio.disabled=true,codRadio.checked=false); paypalRadio && (paypalRadio.disabled=false); const v=validateAllFields(); if (v.valid) { paypalRadio && (paypalRadio.checked=true); showPayPalUI(); renderPayPalButtonsIfNeeded(); } else { paypalRadio && (paypalRadio.checked=false); showCODUI(); } }
    else { codRadio && (codRadio.disabled=false,codRadio.checked=true); paypalRadio && (paypalRadio.disabled=false); showCODUI(); }
  }

  function onPaymentRadioChange(e) {
    if (window.formDisabled) { codRadio && (codRadio.disabled=true); paypalRadio && (paypalRadio.disabled=true); return; }
    if (e.target.id === 'cod') { showCODUI(); return; }
    if (e.target.id === 'credit') {
      const v = validateAllFields();
      if (!v.valid) { try{ alert('Please fill all required fields correctly before online payment.'); }catch(e){}; e.target.checked=false; codRadio && (codRadio.checked=true); showCODUI(); applyValidationUI(v); if (v.firstInvalidId) document.getElementById(v.firstInvalidId)?.focus(); return; }
      showPayPalUI(); renderPayPalButtonsIfNeeded();
    }
  }

  function renderPayPalButtonsIfNeeded() {
    if (window.formDisabled) return;
    if (typeof paypal === 'undefined') { console.warn('PayPal SDK not loaded.'); return; }
    if (paypalRendered) return;
    paypalRendered = true;
    paypal.Buttons({
      style:{layout:'vertical',color:'gold',shape:'rect',label:'paypal'},
      createOrder: function(data, actions) {
        const amount = getGrandTotalAmount();
        const currency = 'EUR';
        if (!amount || amount<=0) { alert('Invalid order amount.'); return Promise.reject(); }
        return actions.order.create({ purchase_units:[{ amount:{ value: amount.toFixed(2), currency_code: currency } }] });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details){
          const txId = details.id || '';
          const payerEmail = details.payer && details.payer.email_address ? details.payer.email_address : '';
          const paymentStatusInput = document.getElementById('paymentStatus');
          const paymentTxInput = document.getElementById('paymentTxId');
          if (paymentStatusInput) paymentStatusInput.value = 'Paid';
          if (paymentTxInput) paymentTxInput.value = txId;
          if (paypalRadio) paypalRadio.checked = true;
          try { if (typeof populateCartDetails === 'function') populateCartDetails(); } catch(e){}
          const cartDetailsField = document.getElementById('cartDetails');
          if (cartDetailsField) cartDetailsField.value = (cartDetailsField.value || '') + `\nPayment TX: ${txId}\nPayer: ${payerEmail}`;
          setTimeout(()=>{ try{ if (form && typeof form.requestSubmit === 'function') form.requestSubmit(); else if (form) form.submit(); }catch(err){ console.error(err);} }, 150);
        });
      },
      onError: function(err){ console.error('PayPal error:', err); alert('There was an error with PayPal checkout.'); },
      onCancel: function(data){ alert('PayPal payment cancelled.'); }
    }).render('#paypal-button-container');
  }

  if (countrySelect) countrySelect.addEventListener('change', updatePaymentOptionsFromCountry);
  if (codRadio) codRadio.addEventListener('change', onPaymentRadioChange);
  if (paypalRadio) paypalRadio.addEventListener('change', onPaymentRadioChange);

  requiredFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const selectedCountry = countrySelect ? (countrySelect.value||'').trim(): '';
      const v = validateAllFields(); applyValidationUI(v);
      if (!window.formDisabled && selectedCountry !== '' && selectedCountry !== 'Albania' && selectedCountry !== 'Kosovo') {
        if (v.valid) { paypalRadio && !paypalRadio.disabled && (paypalRadio.checked=true, showPayPalUI(), renderPayPalButtonsIfNeeded()); }
        else { paypalRadio && (paypalRadio.checked=false); showCODUI(); }
      }
      ensurePayPalStillAllowedOrFallback();
    });
  });

  // Modal: close only via close button (no backdrop click)
  function closeOrderModal() { if(!backdrop) return; backdrop.style.display = 'none'; }
  if (btnClose && btnClose.addEventListener) btnClose.addEventListener('click', closeOrderModal);

  /* --- IMAGE helper (returns object with dataURL + original width/height after scaling) ---
     We keep aspect ratio and produce an intermediate canvas whose width/height reflect the scaled dims.
     Returns { dataUrl, width, height } or null on failure.
  */
  async function fetchImageScaled(url, maxDim = 300) {
    if (!url) return null;
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      // use ImageBitmap to get original dims
      const imgBitmap = await createImageBitmap(blob);
      const origW = imgBitmap.width;
      const origH = imgBitmap.height;
      const scale = Math.min(1, maxDim / Math.max(origW, origH));
      const w = Math.max(1, Math.round(origW * scale));
      const h = Math.max(1, Math.round(origH * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgBitmap, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      return { dataUrl, width: w, height: h };
    } catch (err) {
      console.warn('fetchImageScaled failed', url, err);
      return null;
    }
  }

  // PDF generator: uses jsPDF if available (with autoTable), otherwise null
  async function generatePDF(customerData = {}, cart = []) {
    const jspdfGlobal = window.jspdf && (window.jspdf.jsPDF || window.jspdf.default) ? (window.jspdf.jsPDF || window.jspdf.default) : null;
    if (!jspdfGlobal) return null; // fallback to printable

    // prepare images for products and logo
    const items = Array.isArray(cart) ? cart : [];
    const productImages = await Promise.all(items.map(it => fetchImageScaled(it.image || '', 200)));
    const logoObj = await fetchImageScaled(businessLogo, 160).catch(()=>null);

    try {
      const doc = new jspdfGlobal({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 36;
      const margin = 36;

      // CENTERED HEADER: logo (if exists) then centered business name & contacts
      if (logoObj && logoObj.dataUrl) {
        const logoW = Math.min(logoObj.width, 160);
        const logoH = Math.round((logoObj.height / logoObj.width) * logoW);
        const logoX = (pageWidth - logoW) / 2;
        doc.addImage(logoObj.dataUrl, 'JPEG', logoX, cursorY, logoW, logoH);
        cursorY += logoH + 15;
      }
      // business name centered
      // doc.setFontSize(16);
      // doc.text(businessName, pageWidth / 2, cursorY, { align: 'center' });
      // cursorY += 18;
      doc.setFontSize(10);
      const contactLine = `${businessPhone} • ${businessEmail}`;
      doc.text(contactLine, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 20;

      // small divider
      doc.setDrawColor(230,230,230);
      doc.setLineWidth(0.5);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 14;

      // CUSTOMER INFO (left aligned)
      doc.setFontSize(12);
      doc.text('Customer', margin, cursorY);
      cursorY += 14;
      doc.setFontSize(10);
      doc.text(`Name: ${customerData.name || ''} ${customerData.surname || ''}`, margin, cursorY); cursorY += 12;
      doc.text(`Email: ${customerData.email || ''}`, margin, cursorY); cursorY += 12;
      doc.text(`Phone: ${customerData.phone || ''}`, margin, cursorY); cursorY += 12;
      doc.text(`Address: ${customerData.address || ''}, ${customerData.city || ''} (${customerData.country || ''})`, margin, cursorY); cursorY += 18;

      // ITEMS via autoTable if available
      if (typeof doc.autoTable === 'function') {
        // build body with placeholder for image column
        const body = items.map((it, idx) => {
          const price = Number(it.price || it.totalPrice || 0) || 0;
          const qty = Number(it.quantity || 1) || 1;
          return [ idx + 1, it.title || it.name || '', String(qty), `€${price.toFixed(2)}`, '' ];
        });

        doc.autoTable({
          startY: cursorY,
          head: [['#', 'Product', 'Qty', 'Price', '']],
          body,
          styles: { fontSize: 10, cellPadding: 6 },
          headStyles: { fillColor: [54,69,79] },
          columnStyles: { 0:{cellWidth:24},1:{cellWidth:260},2:{cellWidth:36},3:{cellWidth:70},4:{cellWidth:80} },
          didDrawCell: function(data) {
            // draw image inside the 5th column cell (index 4)
            if (data.section === 'body' && data.column.index === 4) {
              const rowIndex = data.row.index;
              const imgObj = productImages[rowIndex];
              if (imgObj && imgObj.dataUrl) {
                const cellX = data.cell.x;
                const cellY = data.cell.y;
                const cellW = data.cell.width;
                const cellH = data.cell.height;
                // compute scale preserving aspect ratio and fit inside (cellW-8, cellH-8)
                const maxW = Math.max(8, cellW - 8);
                const maxH = Math.max(8, cellH - 8);
                const scale = Math.min(1, Math.min(maxW / imgObj.width, maxH / imgObj.height));
                const drawW = imgObj.width * scale;
                const drawH = imgObj.height * scale;
                const drawX = cellX + (cellW - drawW) / 2;
                const drawY = cellY + (cellH - drawH) / 2;
                try { doc.addImage(imgObj.dataUrl, 'JPEG', drawX, drawY, drawW, drawH); } catch(e){ /* ignore */ }
              }
            }
          }
        });
        cursorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : cursorY + 120;
      } else {
        // fallback listing while preserving image aspect ratio
        doc.setFontSize(11);
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const imgObj = productImages[i];
          if (imgObj && imgObj.dataUrl) {
            // if not enough space, add page
            if (cursorY + imgObj.height + 14 > doc.internal.pageSize.getHeight() - 36) { doc.addPage(); cursorY = 36; }
            const drawW = Math.min(120, imgObj.width);
            const drawH = Math.round((imgObj.height / imgObj.width) * drawW);
            try { doc.addImage(imgObj.dataUrl, 'JPEG', margin, cursorY, drawW, drawH); } catch(e){}
            const textX = margin + drawW + 8;
            doc.text(`${i+1}. ${it.title || it.name || ''}`, textX, cursorY + 14);
            doc.text(`Qty: ${it.quantity || 1} — €${(Number(it.price||it.totalPrice||0)).toFixed(2)}`, textX, cursorY + 30);
            cursorY += Math.max(drawH, 42) + 8;
          } else {
            if (cursorY + 18 > doc.internal.pageSize.getHeight() - 36) { doc.addPage(); cursorY = 36; }
            doc.text(`${i+1}. ${it.title || it.name || ''} — Qty: ${it.quantity || 1} — €${(Number(it.price||it.totalPrice||0)).toFixed(2)}`, margin, cursorY);
            cursorY += 18;
          }
        }
      }

      // totals area (right align near page right)
      const shippingAmt = getShippingAmount();
      const grand = getGrandTotalAmount();
      const totalsY = Math.min(cursorY + 12, doc.internal.pageSize.getHeight() - 60);
      doc.setFontSize(12);
      // Right aligned totals using centered coordinate math
      doc.text(`Shipping: €${(shippingAmt||0).toFixed(2)}`, pageWidth - margin, totalsY,{ align: 'right' } );
      doc.text(`Total: €${(grand||0).toFixed(2)}`, pageWidth - margin, totalsY + 16,{ align: 'right' } );

      return doc.output('blob');
    } catch (err) {
      console.warn('generatePDF exception', err);
      return null;
    }
  }

  // fallback printable page
  function openPrintableReceipt(customerData = {}, cart = []) {
    try {
      const html = [];
      html.push('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
      html.push(`<title>Order Receipt - ${escapeHtml(businessName)}</title>`);
      html.push('<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#222} .item{display:flex;gap:12px;align-items:center;border-bottom:1px solid #eee;padding:10px 0} img{width:120px;height:auto;object-fit:cover;border-radius:8px} .title{font-weight:700} .meta{color:#666} .total{font-weight:800;margin-top:12px}</style>');
      html.push('</head><body>');
      html.push(`<h1 style="text-align:center">${escapeHtml(businessName)}</h1>`);
      html.push(`<div style="text-align:center;color:#666">${escapeHtml(businessPhone)} • ${escapeHtml(businessEmail)}</div>`);
      html.push(`<h2>Order for ${escapeHtml(customerData.name || 'Customer')}</h2>`);
      html.push(`<div>${escapeHtml(customerData.email || '')} • ${escapeHtml(customerData.phone || '')}</div>`);
      let subtotal = 0;
      (Array.isArray(cart) ? cart : []).forEach(it => {
        const title = escapeHtml(it.title || it.name || 'Product');
        const qty = String(it.quantity || 1);
        const price = Number(it.price || it.totalPrice || 0) || 0;
        subtotal += price * Number(it.quantity || 1);
        const img = escapeHtml(it.image || '');
        html.push('<div class="item">');
        if (img) html.push(`<div><img src="${img}" alt=""></div>`);
        html.push(`<div><div class="title">${title}</div><div class="meta">Qty: ${qty} — €${price.toFixed(2)}</div></div>`);
        html.push('</div>');
      });
      const shippingAmt = getShippingAmount();
      const grand = getGrandTotalAmount();
      html.push(`<div class="total">Subtotal: €${subtotal.toFixed(2)}</div>`);
      html.push(`<div class="total">Shipping: €${(shippingAmt||0).toFixed(2)}</div>`);
      html.push(`<div class="total">Total: €${(grand||0).toFixed(2)}</div>`);
      html.push('<p><button onclick="window.print()">Print / Save as PDF</button></p>');
      html.push('</body></html>');
      const blob = new Blob([html.join('')], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(()=> URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('openPrintableReceipt failed', err);
      try { alert('Order completed. Please print/save the receipt.'); } catch(e){}
    }
  }

  // Open modal and populate with snapshot
  async function openOrderModal(customerData = {}, cartSnapshot = []) {
    if (!backdrop || !modalEl || !itemsCol || !summaryBox || !btnDownload || !btnClose) {
      openPrintableReceipt(customerData, cartSnapshot);
      return;
    }
    itemsCol.innerHTML = '';
    // header: customer
    const custDiv = document.createElement('div');
    custDiv.style.marginBottom = '8px';
    custDiv.innerHTML = `<strong>${escapeHtml(customerData.name||'')} ${escapeHtml(customerData.surname||'')}</strong>
      <div style="color:#666;font-size:13px">${escapeHtml(customerData.email||'')} • ${escapeHtml(customerData.phone||'')}</div>
      <div style="color:#666;font-size:13px">${escapeHtml(customerData.address||'')}, ${escapeHtml(customerData.city||'')} (${escapeHtml(customerData.country||'')})</div>`;
    itemsCol.appendChild(custDiv);

    const items = Array.isArray(cartSnapshot) ? cartSnapshot : [];
    items.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'order-item';
      row.innerHTML = `<img alt="${escapeHtml(it.title||it.name||'')}" src="${escapeHtml(it.image||'')}">
        <div class="meta"><div class="title">${escapeHtml(it.title||it.name||'Product')}</div>
        <div class="muted">Qty: ${escapeHtml(String(it.quantity || 1))} — €${Number(it.price || it.totalPrice || 0).toFixed(2)}</div></div>`;
      itemsCol.appendChild(row);
    });

    // Summary: read shipping & grand total from DOM reliably
    const subtotal = items.reduce((s,it) => s + (Number(it.totalPrice || it.price || 0) * Number(it.quantity || 1)), 0);
    const shipping = getShippingAmount();
    const grand = getGrandTotalAmount();
    summaryBox.innerHTML = `
      <div class="summary-row"><span>Items</span><span>€${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>€${(shipping||0).toFixed(2)}</span></div>
      <div class="summary-row" style="font-weight:800;margin-top:8px"><span>Total</span><span>€${(grand||0).toFixed(2)}</span></div>
    `;

    // Download: generate PDF with full details
    btnDownload.disabled = false;
    downloadCheck.textContent = '';
    btnDownload.onclick = async function() {
      btnDownload.disabled = true;
      downloadCheck.textContent = '...';
      try {
        const blob = await generatePDF(customerData, items);
        if (blob) {
          const filename = `Order_${(new Date()).toISOString().replace(/[:.]/g,'')}.pdf`;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(()=> URL.revokeObjectURL(url), 3000);
          downloadCheck.textContent = '✓';
        } else {
          openPrintableReceipt(customerData, items);
          downloadCheck.textContent = '';
        }
      } catch (err) {
        console.error('PDF generation failed', err);
        openPrintableReceipt(customerData, items);
        downloadCheck.textContent = '';
      } finally {
        btnDownload.disabled = false;
        setTimeout(()=> downloadCheck.textContent = '', 2500);
      }
    };

    // show modal (backdrop shown). Note: clicking outside intentionally does NOT close modal.
    backdrop.style.display = 'flex';
    btnDownload.focus();
  }

  /* ------ Web3Forms submit handler: open modal on success ----- */
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (window.formDisabled) return;

      try { populateCartDetails(); } catch(e){}

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const replyToInput = document.querySelector('input[name="replyto"]');
      if (replyToInput) replyToInput.value = formData.get('email') || '';

      const v = validateAllFields();
      applyValidationUI(v);
      if (!v.valid) {
        const chosen = document.querySelector('input[name="Payment Method"]:checked')?.id || null;
        if (chosen === 'credit') {
          alert('Required fields are not filled correctly — online payment is not allowed. Fix fields or select COD.');
          paypalRadio && (paypalRadio.checked = false);
          paypalContainer && (paypalContainer.style.display = 'none');
          submitBtnDiv && (submitBtnDiv.style.display = 'block');
          if (codRadio && !codRadio.disabled) codRadio.checked = true;
        }
        v.firstInvalidId && document.getElementById(v.firstInvalidId)?.focus();
        return;
      }

      if (result) { result.innerHTML = 'Please wait...'; result.style.opacity = '1'; }
      const json = JSON.stringify(object);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: json
      }).then(async (response) => {
        let j = {};
        try { j = await response.json(); } catch(e){}
        if (response.status === 200) {
          // snapshot BEFORE disabling
          const cartSnapshot = getCart();
          const customerData = {
            name: document.getElementById('firstName')?.value || '',
            surname: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone-number')?.value || '',
            country: document.getElementById('country')?.value || '',
            city: document.getElementById('city')?.value || '',
            address: document.getElementById('address')?.value || '',
            zip: document.getElementById('zip')?.value || ''
          };

          try { disableForm(); } catch(e){ console.warn('disableForm failed', e); }

          try { openOrderModal(customerData, cartSnapshot); } catch (err) { console.error('openOrderModal failed', err); if (result) result.innerHTML = 'Thank you for your order! (Could not show modal)'; }

          if (result) { result.innerHTML = ''; result.style.opacity = '0'; }
        } else {
          console.log('Submit error', response, j);
          if (result) result.innerHTML = j.message || 'Error submitting order';
        }
      }).catch(err => {
        console.error('Submit exception', err);
        if (result) result.innerHTML = 'Something went wrong!';
      }).finally(() => {
        try { form.reset(); } catch(e){}
        setTimeout(() => { if (result) result.style.opacity = '0'; }, 3000);
      });
    });
  }

  // initial render
  renderCart();
  const cartNow = getCart();
  if (!cartNow || cartNow.length === 0) disableForm();
  else { updatePaymentOptionsFromCountry(); const v0 = validateAllFields(); applyValidationUI(v0); if (!v0.valid && paypalContainer) paypalContainer.style.display = 'none'; }

  // expose helper
  window.forceSwitchToCOD = function(msg){ if (msg) try{ alert(msg); }catch(e){}; paypalRadio && (paypalRadio.checked=false); paypalContainer && (paypalContainer.style.display='none'); submitBtnDiv && (submitBtnDiv.style.display='block'); if (codRadio && !codRadio.disabled) codRadio.checked=true; };

}); // DOMContentLoaded end

// disableForm & populateCartDetails (unchanged)
function disableForm() {
  window.formDisabled = true;
  const form = document.getElementById('form');
  if (!form) return;
  const inputs = form.querySelectorAll('input, textarea, select, button');
  inputs.forEach(i => { try { i.disabled = true; } catch(e){} });
  const cartCapsule = document.querySelector('.cart-capsule');
  if (cartCapsule) { const children = cartCapsule.children; for (const child of children) { if (!child.querySelector('span')) child.style.display = 'none'; } }
  const cartBadge = document.getElementById('cartBadge'); if (cartBadge) cartBadge.textContent = '0';
  const cartButton = document.getElementById('btn-cart'); if (cartButton) { cartButton.innerHTML = 'Go back to browsing'; cartButton.setAttribute('onclick', "window.location.href='./shop.html'"); }
  try { localStorage.removeItem('cart'); } catch(e){} try { sessionStorage.removeItem('cart'); } catch(e){}
  const cartItemsDiv = document.getElementById('cartItems'); if (cartItemsDiv) cartItemsDiv.innerHTML = '';
  const credit = document.getElementById('credit'); const cod = document.getElementById('cod');
  if (credit) { const wasChecked = credit.checked; credit.checked = false; credit.disabled = true; const creditLabel = document.querySelector('label[for="credit"]'); if (creditLabel) creditLabel.style.opacity = '0.45'; if (wasChecked) credit.dispatchEvent(new Event('change', { bubbles: true })); }
  if (cod) { cod.checked = false; cod.disabled = true; const codLabel = document.querySelector('label[for="cod"]'); if (codLabel) codLabel.style.opacity = '0.45'; cod.dispatchEvent(new Event('change', { bubbles: true })); }
  const paypalContainer = document.getElementById('paypal-button-container'); if (paypalContainer) paypalContainer.style.display = 'none';
  console.log('Form disabled and cart cleared.');
}

function populateCartDetails() {
  const cartItemsDiv = document.querySelector('#cartItems');
  const cartDetailsField = document.getElementById('cartDetails');
  if (!cartDetailsField) return;
  const cartDetails = [];
  const items = cartItemsDiv ? cartItemsDiv.querySelectorAll('.cart-items') : [];
  items.forEach(item => {
    const title = item.querySelector('.item-title')?.innerText || 'N/A';
    const quantity = item.querySelector('.item-quantity')?.innerText || 'N/A';
    const price = item.querySelector('.item-price')?.innerText || 'N/A';
    cartDetails.push(`-${title} ( ${quantity}, Total: ${price}),`);
  });
  const subtotalText = document.querySelector('#subtotal')?.innerText || 'N/A';
  const shippingText = document.querySelector('#shipping-cost')?.innerText || 'N/A';
  const grandText = document.querySelector('#grand-total')?.innerText || 'N/A';
  cartDetails.push(`Value of order:\n ${subtotalText}`, `${shippingText}`, `${grandText}`);
  cartDetailsField.value = cartDetails.join('\n');
}

/* Utility: escape HTML */
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[c]) });
}
