document.getElementById("year").innerHTML = new Date().getFullYear();

const backToTopBtn = document.getElementById("backToTopBtn");


// window.onload = function() {
//   window.scrollTo(0, 0);
// };


window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    backToTopBtn.style.display = "flex"; /* Shows the button */
  } else {
    backToTopBtn.style.display = "none";
  }
};

backToTopBtn.addEventListener("click", function() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


const container = document.querySelector('.img-container');
const image = document.querySelector('.imagepreview');
const magnifier = document.getElementById('magnifier');
const magnification = 1.2; // Adjust the magnification factor (lower value for less zoom)
const magnifierSize = 200; // Adjust the size of the magnifier

// Create a canvas element for drawing the zoomed area
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = magnifierSize;
canvas.height = magnifierSize;
magnifier.appendChild(canvas);

container.addEventListener('mousemove', e => {
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const ratioX = image.naturalWidth / width;
    const ratioY = image.naturalHeight / height;

    const imageX = Math.round(x * ratioX);
    const imageY = Math.round(y * ratioY);

    const magnifierWidth = magnifier.offsetWidth;
    const magnifierHeight = magnifier.offsetHeight;

    const offsetX = magnifierWidth / 2;
    const offsetY = magnifierHeight / 2;

    // Clear previous content on the canvas
    ctx.clearRect(0, 0, magnifierSize, magnifierSize);

    // Draw the zoomed area of the image on the canvas
    ctx.drawImage(
        image,
        imageX - magnifierSize / (2 * magnification),
        imageY - magnifierSize / (2 * magnification),
        magnifierSize / magnification,
        magnifierSize / magnification,
        0,
        0,
        magnifierSize,
        magnifierSize
    );

    magnifier.style.display = 'block';
    magnifier.style.left = `${x - offsetX}px`;
    magnifier.style.top = `${y - offsetY}px`;
});

container.addEventListener('mouseleave', () => {
    magnifier.style.display = 'none';
});

// Make the magnifier circular
magnifier.style.borderRadius = '50%';
magnifier.style.overflow = 'hidden';


const product = [
    {
        id: 0 ,
        image: './images/waterstop/waterstop1-removebg-preview.png',
        title: ' Waterproof Solution',
        price: '$5',
        description:'Water Stop is a hydrophobic Solution created with care to Effortlessly repel all types of Liquid. ',
        material: 'Leather, Suede, Canvas',
        howto: `1. Clean and dry materials prior to applying repellent.
        2. In a well ventilated area, hold the can upright and apply light, even coats 6-8 inches away from surface.
         3. Allow to dry 60 minutes before wear.`,
        careful:' Dispose of completely empty cans at recycled material collection. Avoid contact with skin and eyes. Keep out of the reach of children.',
    },
    {
        id: 1,
        image: './images/basicpack/basicpack1-removebg-preview.png',
        title: 'All-in-One Basic Pack',
        price: '$5',
        description:'Athletics Clean Basic Kit is the ultimate solution to keep your footwear looking brand new! This all-in-one kit includes a premium cleaning solution, a gentle brush for scrubbing, two stick deodorants and a microfiber cloth for polishing. Perfect for leather shoe types, it removes dirt, stains, humidity , smells and grime with ease, ensuring your shoes always make a great impression. Compact and easy to use, it’s a must-have for anyone who values clean, fresh-looking shoes.  ',
    },
    {
        id: 2,
        image: './images/leatherclean/leatherclean1-removebg-preview.png',
        title: 'Leather Clean Solution',
        price: '$5',
        description:'Athletics Clean - Keep your footwear looking pristine and polished. Experience the difference ',
    },

    // {
    //     id: 3,
    //     image: './images/deosanitizier/deosanitizier1-removebg-preview.png',
    //     title: 'Deo Sanitizier',
    //     price: '$5',
    //     description:'Athletics Deo , our top-performance shoe deodorant, designed for active lifestyles. This powerful formula tackles tough odors and keeps your shoes smelling fresh, no matter how intense your workouts are. ',
    // },

    // {
    //     id: 4,
    //     image: './images/deostick/deostick1-removebg-preview.png',
    //     title: 'Deo Stick',
    //     price: '$5',
    //     description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    // },
    // {
    //     id: 5,
    //     image: './assets/ballina-catalog/6.jpg',
    //     title: 'Smart Watch',
    //     price: '$5',
    //     description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    // },
];


// Function to display products
const displayItem = (items) => {
    const root = document.getElementById('root');
    root.innerHTML = ''; // Clear existing content
    items.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('col-6-sm', 'ballina-col', 'hidden' , 'section');
        card.innerHTML = `
                <a class="catg-item card-text pop" href="#" type="" data-bs-toggle="modal" data-bs-target="#myModal${item.id}" data-item-id="${item.id}">
                    <img class="album-img" src="${item.image}" alt="pieces">
                    <div class="img-ttl card-body" style="text-decoration: none;color:black;">
                        ${item.title}
                    </div>
                    <div class="itm-price"> 
                     ${item.price}
                     </div>
                </a>`;
        root.appendChild(card);

        // Attach event listener to each card
        card.addEventListener('click', () => {
            const selectedItem = product.find(productItem => productItem.id === item.id);
            if (selectedItem) {
                // Populate modal with product data
                document.getElementById("exampleModalLabel").textContent = selectedItem.title;
                document.querySelector(".imagepreview").setAttribute("src", selectedItem.image);
                document.getElementById("prod-description").textContent = selectedItem.description;
                document.getElementById("prod-material").textContent = selectedItem.material;
                document.getElementById("prod-howto").textContent = selectedItem.howto;
                document.getElementById("prod-careful").textContent = selectedItem.careful;

                
                
                
                $('#myModal').modal('show'); // Show the modal
            }
        });
    });
};




// Initial display of all products
displayItem(product);

document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.querySelector('.grid1');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 0) {
      navbar.classList.add('fixed');
      navbar.classList.remove('container');
      navbar.classList.remove('grid-pos');

    } else {
      navbar.classList.remove('fixed');
      navbar.classList.add('container');
      navbar.classList.add('grid-pos');
    }
  });
});




