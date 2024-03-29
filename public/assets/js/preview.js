item_list = document.getElementById("list");

// reload page when window is resized
window.onresize = debounce(() => {
	location.reload();
}, 1000);

function setLoadingStatus(status) {
	if (status === "show") {
		$("#scene-container").html(`<div id="loading">
            <span id="loading-icon">
            </span>
          </div>`);
	} else if (status === "hide") {
		$("#loading").remove();
	}
}

function loadModel(path, config, backgroundColor) {
	const sceneWrapper = document.getElementById("scene-container");

	const width = sceneWrapper.offsetWidth;
	const height = sceneWrapper.offsetHeight;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		70,
		innerWidth / innerHeight,
		0.1,
		5000,
	);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);

	renderer.setClearColor(backgroundColor);

	sceneWrapper.innerHTML = "";

	setLoadingStatus("show");

	sceneWrapper.appendChild(renderer.domElement);

	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.autoRotate = true;
	controls.enablePan = false;
	controls.enableDamping = true;
	controls.mouseButtons = {
		MIDDLE: THREE.MOUSE.DOLLY,
		LEFT: THREE.MOUSE.ROTATE,
	};

	const loader = new THREE.GLTFLoader();

	loader.load(
		`${path}/scene.gltf`,
		function (gltf) {
			gltf.scene.children[0].scale.set(...Object.values(config.scale));

			controls.target.set(...Object.values(config.target));
			controls.update();

			scene.add(gltf.scene);

			setTimeout(() => setLoadingStatus("hide"), 2000);
		},
		undefined,
		function (error) {
			console.error(error);
		},
	);

	// const light = new THREE.AmbientLight(0x00ff55, 10); // soft white light
	// scene.add(light);

	const lightColor = 0xffffff;
	const cuongDoSang = 2;

	// front to back
	const light1 = new THREE.DirectionalLight(lightColor, cuongDoSang);

	light1.position.set(0, 0, 10);
	light1.target.position.set(0, 0, 0);

	scene.add(light1);

	// top to bottom (y)
	const light2 = new THREE.DirectionalLight(lightColor, cuongDoSang);

	light2.position.set(0, 10, 0);
	light2.target.position.set(0, 0, 0);

	scene.add(light2);

	// right to left
	const light3 = new THREE.DirectionalLight(lightColor, cuongDoSang);

	light3.position.set(10, 0, 0);
	light3.target.position.set(0, 0, 0);

	scene.add(light3);

	// left to right
	const light4 = new THREE.DirectionalLight(lightColor, cuongDoSang);

	light4.position.set(-10, 0, 0);
	light4.target.position.set(0, 0, 0);

	scene.add(light4);

	// back to front
	const light5 = new THREE.DirectionalLight(lightColor, cuongDoSang);

	light5.position.set(0, 0, -10);
	light5.target.position.set(0, 0, 0);

	scene.add(light5);

	camera.position.set(...Object.values(config.camera));
	controls.update();

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}
	animate();
}

function createCard(item_name) {
	let shopItem = SHOPITEMS.find((elm) => elm.name === item_name);

	// Main card's elements
	let card = document.createElement("div");
	card.className = "item-card";
	// card.id = items[item_name]
	card.id = item_name;

	let card_image = document.createElement("div");
	card_image.className = "item-image";
	card_image.style.backgroundImage = `url('${shopItem.image}')`;

	const cardInfo = document.createElement("div");
	cardInfo.className = "card-info";
	cardInfo.innerHTML = `
    <h5>${shopItem.vietnameseName}</h5>
    <p><span>${formatVND(shopItem.price)}</span> VND</p>
  `;

	let card_buttons = document.createElement("div");
	card_buttons.className = "item-buttons";

	// Card Buttons
	let upload_button = document.createElement("button");
	upload_button.onclick = () => {
		const textureWrapper = document.getElementById("textures-container");
		textureWrapper.innerHTML = "";

		// Generate textures card
		shopItem.texture.forEach((color) => {
			const newTextureCard = document.createElement("div");
			newTextureCard.className = "texture-card";

			const textureImage = document.createElement("div");
			textureImage.className = "texture-image";
			const { r, g, b } = hexToRGB(color);
			textureImage.style.backgroundColor = `rgb(${r},${g},${b})`;
			newTextureCard.appendChild(textureImage);

			const textureButtonWrapper = document.createElement("div");
			textureButtonWrapper.className = "texture-buttons";

			const uploadButton = document.createElement("button");
			uploadButton.innerHTML = "Xem";
			uploadButton.onclick = () => {
				window.scrollTo(0, 0);
				loadModel(shopItem.modelFolder, shopItem.config, color);
			};

			textureButtonWrapper.appendChild(uploadButton);

			newTextureCard.appendChild(textureButtonWrapper);

			textureWrapper.appendChild(newTextureCard);
		});

		window.scrollTo(0, 0);

		loadModel(shopItem.modelFolder, shopItem.config, shopItem.texture[0]);

		// load product's info
		document.getElementById("product-name").innerText = shopItem.vietnameseName;
		document.getElementById("product-price").innerText = formatVND(
			shopItem.price,
		);
		document.getElementById("product-des").innerText = shopItem.description;
	};

	let add_cart_button = document.createElement("button");
	add_cart_button.onclick = function add_cart() {
		if (localStorage.getItem(item_name)) {
			$("#modal-body").text("Sản phẩm hiện đã có trong giỏ hàng.");

			$("#exampleModal").modal("show");

			return;
		}

		$("#modal-body").text("Thêm vào giỏ hàng thành công.");

		$("#exampleModal").modal("show");

		localStorage.setItem(item_name, 1);
	};

	// Card Buttons' Icon
	// let upload_button_icon = document.createElement("i");
	// upload_button_icon.className = "fa fa-upload";

	// let add_cart_button_icon = document.createElement("i");
	// add_cart_button_icon.className = "fa fa-cart-plus";

	// upload_button.appendChild(upload_button_icon);
	// add_cart_button.appendChild(add_cart_button_icon);

	upload_button.innerHTML = "Xem";
	add_cart_button.innerHTML = "Mua";

	card_buttons.appendChild(upload_button);
	card_buttons.appendChild(add_cart_button);
	card.appendChild(card_image);
	card.appendChild(cardInfo);
	card.appendChild(card_buttons);

	return card;
}

// item_list.appendChild(createCard("Sofa"));

// Load all items in SHOPITEMS with index 0 => (itemPerPage - 1)
const itemPerPage = 6;
SHOPITEMS.slice(0, 6).forEach((item) => {
	item_list.appendChild(createCard(item.name));
});

// Generate page number;
const generatePageNumber = (itemsArray) => {
	const itemCount = itemsArray.length;
	const pageCount = Math.ceil(itemCount / itemPerPage);

	const pageNumberBox = document.getElementById("page-number");

	pageNumberBox.innerHTML = "";

	for (let index = 0; index < pageCount; ++index) {
		const button = document.createElement("button");
		button.innerText = index + 1;

		// Check if button is the first one, add class "active" to it
		if (index === 0) {
			button.className = "active";
		}

		button.onclick = () => {
			let from = index * itemPerPage;
			let to = from + itemPerPage - 1;

			if (to > itemCount - 1) {
				to = itemCount - 1;
			}

			item_list.innerHTML = "";

			for (let index = from; index <= to; ++index) {
				item_list.appendChild(createCard(itemsArray[index].name));
			}

			// Remove class "active" from all buttons
			$("#page-number button").removeClass("active");

			// Add class "active" to current button
			button.className = "active";
		};

		pageNumberBox.appendChild(button);
	}
};

generatePageNumber(SHOPITEMS);

// Search logic
const searchInput = document.getElementById("search");
searchInput.onkeyup = debounce(() => {
	const value = searchInput.value;

	const filteredShopItems = [...SHOPITEMS].filter((elm) =>
		elm.vietnameseName.toLowerCase().includes(value.toLowerCase()),
	);

	item_list.innerHTML = "";

	filteredShopItems.slice(0, itemPerPage).forEach((item) => {
		item_list.appendChild(createCard(item.name));
	});

	generatePageNumber(filteredShopItems);
}, 300);

// Click button to load model when user redirecting to home
$("#Sofa button:first-child").click();

// Ads logic
const adsText = $("#ads-text");
const adsBox = $("#ads-box");

const defaultTop = adsBox.height();

let offsetTop = defaultTop;
setInterval(() => {
	adsText.css("top", offsetTop + "px");

	offsetTop = offsetTop - 1;

	if (offsetTop === 0 - adsText.height()) {
		offsetTop = defaultTop;
	}
}, 10);

// Check if user scrolled to bottom, set top of ads to 0%
window.onscroll = function () {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
		adsBox.css("top", "-5%");
	} else {
		adsBox.css("top", "10%");
	}
};
