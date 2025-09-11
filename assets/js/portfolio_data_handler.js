async function loadProject() {
  console.log("Loading project...");

  // Get project ID from query string
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  console.log("Full query string:", window.location.search);
  console.log("Our project ID is:", projectId);

  if (!projectId) {
    console.error("No project ID found in URL");
    return;
  }

  try {

    // Load projects.json
    console.log("Fetching projects.json...");
    const response = await fetch("assets/data/projects.json");
    const projects = await response.json();
    console.log("Projects loaded:", projects);

    // Find the right project
    const project = projects.find(p => p.id === projectId);
    console.log("Project found ", project)
    if (!project) {
      console.error("Project not found in JSON:", projectId);
      document.getElementById("project-title").textContent = "Project not found";
      return;
    }

    // Fill in details
    document.getElementById("project-title").textContent = project.title;
    document.getElementById("project-category").textContent = project.category;
    document.getElementById("project-client").textContent = project.client;
    document.getElementById("project-date").textContent = project.date;

    const projectUrl = document.getElementById("project-url");
    projectUrl.textContent = project.url;
    //projectUrl.href = project.url;

    document.getElementById("project-description").textContent = project.description;

    // Add images to slider
    const imagesContainer = document.getElementById("project-images");
    imagesContainer.innerHTML = "";

    project.slides.forEach(slideData => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      if (slideData.type === "image") {
        slide.innerHTML = `<img src="${slideData.src}" alt="${project.title}">`;
      } else if (slideData.type === "video") {
        slide.innerHTML = `
      <video class="project-video" controls preload="metadata">
        <source src="${slideData.src}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
      }

      imagesContainer.appendChild(slide);
    });



    //Update Swiper instead of re-initializing
    if (window.projectSwiper) {
      window.projectSwiper.update();   // refresh layout
      window.projectSwiper.slideTo(0); // reset to first slide
    }

    // Stop videos when changing project
    document.querySelectorAll(".project-video").forEach(video => {
      video.pause();
      video.currentTime = 0;
    });




    // Initialize Swiper
    window.projectSwiper = new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      on: {
        //Stop video whenever slide changes
        slideChange: () => {
          document.querySelectorAll(".project-video").forEach(video => {
            video.pause();
            video.currentTime = 0;
          });

        }
      }
    });

    // Stop Swiper autoplay while a video is playing
    document.querySelectorAll(".project-video").forEach(video => {
      video.addEventListener("play", () => {
        if (window.projectSwiper.autoplay) {
          window.projectSwiper.autoplay.stop();
        }
      });

      video.addEventListener("ended", () => {
        if (window.projectSwiper.autoplay) {
          window.projectSwiper.autoplay.start();
        }
      });
    });

    //Stop any playing video when the slide changes
    window.projectSwiper.on("slideChange", () => {
      document.querySelectorAll(".project-video").forEach(video => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0; // restart video (optional: remove this line if you want it to resume later)
        }
      });

      //Restart autoplay after swipe
      if (window.projectSwiper.autoplay) {
        window.projectSwiper.autoplay.start();
      }
    });

    console.log("Project loaded successfully");

  } catch (err) {
    console.error("Error loading project:", err);
  }
}

// Run loader on page load
document.addEventListener("DOMContentLoaded", loadProject);

// Stop all videos when leaving the page (navigating to another project or closing lightbox)
window.addEventListener("beforeunload", () => {
  document.querySelectorAll(".project-video").forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
});
