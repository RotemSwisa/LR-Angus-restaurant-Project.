import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
//הופעת הסניפים בסרגל בעת לחיצתם
export class NavbarComponent {
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