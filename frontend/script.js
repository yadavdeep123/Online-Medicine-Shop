 const imageSources = [
    "https://onemg.gumlet.io/950ff531-b51e-44b8-86bd-f30b5c327ad8_1748848698.jpg?w=901&h=200&format=auto",
    "https://onemg.gumlet.io/2025-07%2F1752237576_Monsoon_960x200.png?w=901&h=200&format=auto",
    "https://onemg.gumlet.io/38ce4d37-8bd5-4fe7-94dd-3953062595c5_1743761276.png?w=901&h=200&format=auto",
    "https://onemg.gumlet.io/e0686aa4-1aab-4f47-a576-696dcec8cf12_1709298575.png?w=901&h=200&format=auto",
    "https://onemg.gumlet.io/2024-12%2F1734003663_960x200.png?w=901&h=200&format=auto"
  ];
  

  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('dotsContainer');
  const pauseBtn = document.getElementById('pauseBtn');
  const leftArrow = document.getElementById('leftArrow');
  const rightArrow = document.getElementById('rightArrow');

  let current = 1;
  let autoScroll = true;
  let interval = null;

  function setupCarousel() {
    // Create clone of last image (put at start)
    const cloneFirst = document.createElement('div');
    cloneFirst.className = 'carousel-item';
    cloneFirst.innerHTML = `<img src="${imageSources[0]}" alt="Clone First">`;

    const cloneLast = document.createElement('div');
    cloneLast.className = 'carousel-item';
    cloneLast.innerHTML = `<img src="${imageSources[imageSources.length - 1]}" alt="Clone Last">`;

    // Add clone last at start
    track.appendChild(cloneLast.cloneNode(true));

    // Add real items
    imageSources.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.innerHTML = `<img src="${src}" alt="Ad ${i + 1}">`;
      track.appendChild(item);
    });

    // Add clone first at end
    track.appendChild(cloneFirst.cloneNode(true));

    track.style.transform = `translateX(-100%)`;

    createDots();
    startAutoScroll();
  }

  function moveToSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${index * 100}%)`;
    current = index;
    updateDots();
  }

  function updateDots() {
    const dotIndex = (current - 1 + imageSources.length) % imageSources.length;
    [...dotsContainer.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === dotIndex);
    });
  }

  function createDots() {
    for (let i = 0; i < imageSources.length; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.addEventListener('click', () => moveToSlide(i + 1));
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function nextSlide() {
    const items = document.querySelectorAll('.carousel-item');
    if (current >= items.length - 1) return;

    current++;
    moveToSlide(current);

    // Reset to real first after last clone
    track.addEventListener('transitionend', () => {
      if (current === items.length - 1) {
        track.style.transition = 'none';
        current = 1;
        track.style.transform = `translateX(-${current * 100}%)`;
      }
    }, { once: true });
  }

  function prevSlide() {
    const items = document.querySelectorAll('.carousel-item');
    if (current <= 0) return;

    current--;
    moveToSlide(current);

    // Reset to real last after first clone
    track.addEventListener('transitionend', () => {
      if (current === 0) {
        track.style.transition = 'none';
        current = items.length - 2;
        track.style.transform = `translateX(-${current * 100}%)`;
      }
    }, { once: true });
  }

  function startAutoScroll() {
    interval = setInterval(() => {
      if (autoScroll) {
        nextSlide();
      }
    }, 4000);
  }

  function stopAutoScroll() {
    clearInterval(interval);
    interval = null;
    autoScroll = false;
    pauseBtn.textContent = '▶';
  }

  function toggleAutoScroll() {
    if (autoScroll) {
      stopAutoScroll();
    } else {
      autoScroll = true;
      pauseBtn.textContent = '⏸';
      startAutoScroll();
    }
  }

  // Events
  rightArrow.addEventListener('click', nextSlide);
  leftArrow.addEventListener('click', prevSlide);
  pauseBtn.addEventListener('click', toggleAutoScroll);
  window.addEventListener('resize', () => moveToSlide(current));

  // Init
  setupCarousel();
  console.log(imageSources)
// {<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script> }





  
//   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>



//   function scrollLeft() {
//     document.getElementById("dealScroll").scrollBy({ left: -300, behavior: 'smooth' });
//   }

//   function scrollRight() {
//     document.getElementById("dealScroll").scrollBy({ left: 300, behavior: 'smooth' });
//   }



//     function scrollLeft() {
//       document.getElementById("personalScroll").scrollBy({
//         left: -200,
//         behavior: 'smooth'
//       });
//     }

//     function scrollRight() {
//       document.getElementById("personalScroll").scrollBy({
//         left: 200,
//         behavior: 'smooth'
//       });
//     }

//      const container = document.getElementById('scrollContainer');

//     function scrollLeft() {
//       container.scrollBy({
//         left: -300,
//         behavior: 'smooth'
//       });
//     }

//     function scrollRight() {
//       container.scrollBy({
//         left: 300,
//         behavior: 'smooth'
//       });
//     }

//     function scrollLeft() {
//     document.getElementById("dealScroll").scrollBy({ left: -300, behavior: 'smooth' });
//   }

//   function scrollRight() {
//     document.getElementById("dealScroll").scrollBy({ left: 300, behavior: 'smooth' });
//   }

//    function toggleMenu() {
//       document.getElementById('menu').classList.toggle('show');
//     }

    
//   function toggleMenu() {
//     document.getElementById('menu').classList.toggle('show');
//   }




  fetch('http://localhost:5000/api/products')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    
  });



