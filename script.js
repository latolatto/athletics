document.getElementById("year").innerHTML = new Date().getFullYear();

const backToTopBtn = document.getElementById("backToTopBtn");

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


const product = [
    {
        id: 0 ,
        image: './images/waterstop/waterstop1.png',
        title: ' Waterproof Solution',
        price: '$5',
        description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    },
    {
        id: 1,
        image: './images/basicpack/basicpack1.png',
        title: 'All-in-One Basic Pack',
        price: '$5',
        description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    },
    {
        id: 2,
        image: './images/leatherclean/leatherclean1.png',
        title: 'Leather Clean Solution',
        price: '$5',
        description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    },

    // {
    //     id: 3,
    //     image: './images/deosanitizier/deosanitizier1.png',
    //     title: 'Deo Sanitizier',
    //     price: '$5',
    //     description:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
    // },

    // {
    //     id: 4,
    //     image: './images/deostick/deostick1.png',
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
        card.classList.add('col-6-sm', 'ballina-col');
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
                $('#myModal').modal('show'); // Show the modal
            }
        });
    });
};

// Initial display of all products
displayItem(product);

