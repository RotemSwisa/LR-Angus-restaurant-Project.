import { Component, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit {

 //לוגיקת התמונות במערך
  carouselImages: string[] = [
    '/assets/img/0.avif', '/assets/img/15.jpg', '/assets/img/14.jpg',
    '/assets/img/4.png', '/assets/img/1.png', '/assets/img/6.png',
    '/assets/img/3.png', '/assets/img/5.jpg', '/assets/img/2.png',
    '/assets/img/7.webp', '/assets/img/8.jpg', '/assets/img/9.webp',
    '/assets/img/10.webp', '/assets/img/11.jpg', '/assets/img/12.jpg',
    '/assets/img/16.webp', '/assets/img/13.jpg', '/assets/img/17.png',
  ];

  ngAfterViewInit(): void {
    this.initializeCarousel();
  }

//עצירה אוטומטית במעבר העכבר
  private initializeCarousel(): void {
    if (typeof window === 'undefined') return;

    const container = document.querySelector('.image-carousel-container');
    const wrapper = document.getElementById('carouselWrapper');
    
    if (container && wrapper) {
      container.addEventListener('mouseenter', () => {
        wrapper.style.animationPlayState = 'paused';
      });
      container.addEventListener('mouseleave', () => {
        wrapper.style.animationPlayState = 'running';
      });
    }
  }

// סקריפט לבחירת הסניף
  selectedBranch: string = '';

  updateBranch(): void {
    const branchSelect = document.getElementById("branch-select") as HTMLSelectElement;
    const branch = branchSelect?.value;
    const branchDisplay = document.getElementById("branch-display");

    if (branchDisplay) {
      branchDisplay.textContent = branch ? "סניף " + branch : "";
      branchDisplay.style.display = branch ? "inline-block" : "none";
    }

    this.selectedBranch = branch;
    document.title = branch ? "LR-Angus - " + branch : "LR-Angus - מסעדת בשרים";
    
    const branchElement = document.getElementById("branch-name");
    if (branchElement) {
      branchElement.innerText = branch ? "LR-Angus - " + branch : "LR-Angus";
    }
  }
}