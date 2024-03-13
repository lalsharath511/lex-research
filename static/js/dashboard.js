document.addEventListener("DOMContentLoaded", function () {
  const historyItems = document.querySelectorAll(".history-item");
  historyItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      const question = this.getAttribute("data-question");
      const response = this.getAttribute("data-response");
      // Populate the context and recommendation boxes
      document.getElementById("situationInput").value = question;
      document.getElementById("recommendationOutput").innerText =
        response;
      // Show the recommendation heading
      showRecommendationHeading();
      // Add border to the response box
      showResponseBoxBorder();
      // Show the question box
      document.querySelector(".question-box").style.display = "block";
     

      // Scroll to the bottom of the main content
      scrollToBottom();
    });
  });
});

// Function to scroll to the bottom of the main content
function scrollToBottom() {
  var mainContent = document.getElementById("main-content");
  mainContent.scrollTop = mainContent.scrollHeight;
   
 }

document.addEventListener("DOMContentLoaded", function () {
  var historyItems = document.querySelectorAll(".history-item");

  historyItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      // Remove active class from all history items
      historyItems.forEach(function (item) {
        item.classList.remove("active");
      });

      // Add active class to the clicked history item
      this.classList.add("active");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var historyItems = document.querySelectorAll(".history-item-wrapper");

  historyItems.forEach(function (item) {
    item.addEventListener("mouseenter", function (event) {
      var deleteIcon = this.querySelector(".delete-icon");
      deleteIcon.style.display = "inline";
    });

    item.addEventListener("mouseleave", function (event) {
      var deleteIcon = this.querySelector(".delete-icon");
      deleteIcon.style.display = "none";
    });
  });
});

// Function to toggle delete option visibility
function toggleDeleteOption(deleteIcon) {
  var deleteButton = deleteIcon.nextElementSibling; // Get the delete button next to the delete icon
  deleteButton.style.display =
    deleteButton.style.display === "none" ? "inline-block" : "none"; // Toggle the visibility of the delete button
}

// Function to delete the chat item
function deleteQuestion(deleteOption) {
  var historyItemWrapper = deleteOption.parentNode;
  var historyItem = historyItemWrapper.querySelector(".history-item");
  var question = historyItem.getAttribute("data-question");

  // Send an AJAX request to delete the question from the database
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/delete-question", true);
  xhr.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Successfully deleted the question, remove it from the UI
        historyItemWrapper.parentNode.removeChild(historyItemWrapper);
      } else {
        // Handle error response
        console.error("Failed to delete question:", xhr.responseText);
      }
    }
  };
  xhr.send("question=" + encodeURIComponent(question));
}



function sendSituation() {
  // Show loading indicator while waiting for response
  showLoadingIndicator();

  var situationInput = document.getElementById("situationInput").value;

  // Send situationInput to the backend using fetch
  fetch("/get_recommendation", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      situation: situationInput,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update the content of recommendationOutput with the response from the backend
      document.getElementById("recommendationOutput").innerText =
        data.recommendation;

      // Show the recommendation heading
      showRecommendationHeading();
      // Add border to the response box
      showResponseBoxBorder();

      // Hide loading indicator once response is received
      hideLoadingIndicator();

      // Show the question box and feedback buttons
      document.querySelector(".question-box").style.display = "block";
      document.querySelector(".feedback-buttons").style.display = "block";

      // Ensure the main content area scrolls to the bottom after new content is added
      var mainContent = document.getElementById("main-content");
      mainContent.scrollTop = mainContent.scrollHeight;

      // Automatically scroll down with smooth behavior
      mainContent.classList.add("auto-scroll");

      
    })
    .catch((error) => console.error("Error:", error));
}


function showLoadingIndicator() {
  // Show loading indicator
  var loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block";
}

function hideLoadingIndicator() {
  // Hide loading indicator
  var loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "none";
}

function showRecommendationHeading() {
  // Get the recommendation heading element
  var recommendationHeading = document.getElementById(
    "recommendationHeading"
  );

  // Show the recommendation heading
  recommendationHeading.style.display = "block";
}

function showResponseBoxBorder() {
  // Get the response box element
  var responseBox = document.querySelector(".response-box");

  // Add a border to the response box
  responseBox.style.border = "1px solid #ccc";
  responseBox.style.backgroundColor = "#fff";
}

function handleLike() {
  // Send feedback to the server
  sendFeedback("like");
}

function handleDislike() {
  // Send feedback to the server
  sendFeedback("dislike");
}

function sendFeedback(feedbackType) {
  var situationInput = document.getElementById("situationInput").value;

  // Send situationInput and feedbackType to the backend using fetch
  fetch("/provide_feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      situation: situationInput,
      feedback_type: feedbackType,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => console.error("Error:", error));
}
function provideFeedback() {
  // Open the feedback modal
  $("#feedbackModal").modal("show");
}

function submitFeedback() {
  var feedbackInput = document.getElementById("feedbackInput").value;
  var situationInput = document.getElementById("situationInput").value;

  // Send feedback to the backend using fetch
  fetch("/submit_feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      feedback: feedbackInput,
      situation: situationInput,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message); // Display a success message or handle as needed
      $("#feedbackModal").modal("hide"); // Close the feedback modal
    })
    .catch((error) => console.error("Error:", error));
}

function clearChat() {
  // Clear the recommendation output
  document.getElementById("recommendationOutput").innerText = "";

  // Hide the question box and feedback buttons
  document.querySelector(".question-box").style.display = "none";
  document.querySelector(".feedback-buttons").style.display = "none";
 // Hide the question box and feedback buttons
 document.querySelector(".questionn-box").style.display = "none";
  // Reset the border of the response box to 0
  resetResponseBoxBorder();

  // Hide the recommendation heading
  hideRecommendationHeading();

  // Clear the situation input
  document.getElementById("situationInput").value = "";

    // Clear the table
    clearTable();

  var historyItems = document.querySelectorAll(".history-item");

  // Remove active class from all history items
  historyItems.forEach(function (item) {
    item.classList.remove("active");
  });
  // Hide the share options
  hideShareOptions();
  hideprintOptions();
  hideShareeOptions();
  hideprinttOptions();
}
function clearTable() {
  // Get the table body element
  var tableBody = document.querySelector("#content");

  // Remove all child elements (rows) from the table body
  tableBody.innerHTML = "";
}

function hideShareOptions() {
  // Hide the share options dropdown menu
  var shareOptions = document.getElementById("shareOptions");
  shareOptions.style.display = "none";
}

function hideprintOptions() {
  // Hide the share options dropdown menu
  var shareOptions = document.getElementById("printOptions");
  shareOptions.style.display = "none";
}
function hideShareeOptions() {
  // Hide the share options dropdown menu
  var shareOptions = document.getElementById("shareOptions");
  shareOptions.style.display = "none";
}

function hideprinttOptions() {
  // Hide the share options dropdown menu
  var shareOptions = document.getElementById("printOptions");
  shareOptions.style.display = "none";
}

function resetResponseBoxBorder() {
  // Get the response box element
  var responseBox = document.querySelector(".response-box");

  // Reset the border of the response box to 0
  responseBox.style.border = "none";
  responseBox.style.backgroundColor = "transparent";
}

function hideRecommendationHeading() {
  // Get the recommendation heading element
  var recommendationHeading = document.getElementById(
    "recommendationHeading"
  );

  // Hide the recommendation heading
  recommendationHeading.style.display = "none";
}


// Add a click event listener to the "Show" buttons
$(document).on("click", ".show-summary", function() {
  // Hide any previously displayed detailed summaries
  $(".detailed-summary-container").remove();

  // Get the detailed summary content
  var detailedSummary = $(this).siblings(".detailed-summary").html();

  // Create a new row to display the detailed summary
  var detailedSummaryRow = $("<tr class='detailed-summary-container'><td colspan='9'><div class='white-box'>" + detailedSummary + "</div><button class='remove-summary'>Remove</button></td></tr>");

  // Insert the new row after the current row
  $(this).closest("tr").after(detailedSummaryRow);
});

// Add a click event listener to the "Remove" buttons
$(document).on("click", ".remove-summary", function() {
  // Remove the detailed summary container row
  $(this).closest(".detailed-summary-container").remove();
});

function handleYes() {
  // Show loading indicator while waiting for response
  showLoadingIndicator();

  var recommendationText = $("#recommendationOutput").text();
  var situationInput = $("#situationInput").val();

  $.ajax({
      type: "POST",
      url: "/handle_yes",
      data: JSON.stringify({
          answer: recommendationText,
          question: situationInput,
      }),
      contentType: "application/json",
      success: function(response) {
          console.log(response); // Log the response
          var responseData = JSON.parse(response);
          var tableBody = $("#dataTable tbody");
          tableBody.empty(); // Clear existing rows

          responseData.forEach(function(item) {
              // Create a new row
              var row = "<tr>";
              row += "<td>" + item.case_no + "</td>";
              row += "<td>" + item.petitioner + "</td>";
              row += "<td>" + item["respondent "] + "</td>";
              row += "<td>" + item.date + "</td>";
              row += "<td>" + item.judge + "</td>";
              row += "<td>" + item.prediction + "</td>";
              // Add the summary column with a "Show" button and detailed summary
              row += "<td><button class='show-summary'>Show</button><div class='detailed-summary' style='display:none'>" + item.summary + "</div></td>";
              row += '<td><a href="' + item.pdf_url + '">PDF</a></td>'; // Link to PDF
              row += "<td><input type='checkbox' class='rowCheckbox'></td>"; // Checkbox column
              row += "</tr>";

              // Append the row to the table
              tableBody.append(row);
          });

          // Show the table container
          $("#content").show();


          // Automatically scroll to the bottom of the screen
          scrollToBottom();


           // Show the question box and feedback buttons
           document.querySelector(".questionn-box").style.display = "block";

  // Automatically scroll to the bottom of the screen
          scrollToBottom();
          // Hide loading indicator once response is received
          hideLoadingIndicator();
      },
      error: function(xhr, status, error) {
          // Handle errors here
          console.error(error);
          // Hide loading indicator in case of error
          hideLoadingIndicator();
      }
  });
}





function handleNo() {
  // Open a modal pop-up for print and share options
  $("#printShareModal").modal("show");

  // Show the Print button when "No" is clicked
  document.getElementById("printButton").style.display = "inline-block";

  document.getElementById("shareButton").style.display = "inline-block";
}

// Function to print as PDF using "Microsoft Print to PDF"
function printPDF() {
  var situationInput = document.getElementById("situationInput").value;
  var recommendationOutput = document.getElementById(
    "recommendationOutput"
  ).innerText;
  var printWindow = window.open("", "_blank");

  // Add content to the new window with improved styling
  printWindow.document.write(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Printed Content (PDF)</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              position: relative; /* Set position relative to enable absolute positioning of watermark */
          }
          h3 {
              color: #333;
          }
          p {
              white-space: pre-wrap;
          }
          .watermark {
              position: absolute;
              top: 50%; /* Adjust the top position */
              left: 50%; /* Adjust the left position */
              transform: translate(-50%, -50%) rotate(-45deg); /* Adjust rotation and positioning */
              font-size: 20px; /* Adjust font size */
              opacity: 0.2; /* Adjust opacity */
              pointer-events: none; /* Ensure the watermark text is not selectable */
          }
      </style>
  </head>
  <body>
      <div class="watermark">LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.</div> <!-- Add watermark text -->
      <h3>Context:</h3>
      <p>${situationInput}</p>
      <h3>Proposal:</h3>
      <p>${recommendationOutput}</p>
  </body>
  </html>
`);
  // Close the document stream
  printWindow.document.close();
  // Trigger the print dialog
  printWindow.print();
}

// Function to print as DOC
function printDOC() {
  var recommendationOutput = document.getElementById(
    "recommendationOutput"
  ).innerHTML;
  var situationInput = document.getElementById("situationInput").value;

  // Create content with consistent styling
  var content = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              font-size: 16px;
              position: relative; /* Set position relative to enable absolute positioning of watermark */
          }
          h3 {
              color: #333;
              font-size: 20px;
          }
          p {
              white-space: pre-wrap;
              margin-bottom: 10px;
          }
          .recommendation {
              margin-left: 20px; /* Adjust indentation as needed */
          }
          .watermark {
              position: absolute;
              top: 50%; /* Adjust the top position */
              left: 50%; /* Adjust the left position */
              transform: translate(-50%, -50%) rotate(-45deg); /* Adjust rotation and positioning */
              font-size: 20px; /* Adjust font size */
              opacity: 0.2; /* Adjust opacity */
          }
      </style>
  </head>
  <body>
      <div class="watermark">LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.</div> <!-- Add watermark text -->
      <h3>Context:</h3>
      <p>${situationInput}</p>
      <h3>Proposal:</h3>
      <div class="recommendation">${recommendationOutput}</div>
  </body>
  </html>
`;

  // Create a new Blob object containing the content
  var blob = new Blob([content], { type: "application/msword" });

  // Create a temporary anchor element
  var anchor = document.createElement("a");
  anchor.href = window.URL.createObjectURL(blob);

  // Set the file name
  anchor.download = "document.doc";

  // Programmatically click the anchor to trigger the download
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(anchor.href);
}

function handlePrintButton() {
  var printOptions = document.getElementById("printOptions");
  var shareOptions = document.getElementById("shareOptions");

  // Toggle the visibility of print options
  if (
    printOptions.style.display === "none" ||
    printOptions.style.display === ""
  ) {
    printOptions.style.display = "block";
    shareOptions.style.display = "none";
  } else {
    printOptions.style.display = "none";
  }
}

// Function to toggle the visibility of share options
function toggleShareOptions() {
  var printOptions = document.getElementById("printOptions");
  var shareOptions = document.getElementById("shareOptions");

  // Toggle the visibility of share options
  if (shareOptions.style.display === "none") {
    shareOptions.style.display = "block";
    printOptions.style.display = "none";
  } else {
    shareOptions.style.display = "none";
  }
}

function shareViaGmail() {
  var companyName = "LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.";
  var situationInput = encodeURIComponent(
    document.getElementById("situationInput").value
  );
  var recommendationOutput = encodeURIComponent(
    document.getElementById("recommendationOutput").innerText
  );
  var currentDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  }); // Get current date and time in Indian time zone
  var mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${companyName}&body=Context:%0A${situationInput}%0A%0AProposal:%0A${recommendationOutput}%0A%0ASent%20on:%20${currentDate}`;
  window.open(mailtoLink, "_blank");
}
function shareViaWhatsApp() {
  var companyName = "LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.";
  var situationInput = encodeURIComponent(
    document.getElementById("situationInput").value
  );
  var recommendationOutput = encodeURIComponent(
    document.getElementById("recommendationOutput").innerText
  );
  var currentDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  }); // Get current date and time in Indian time zone
  var shareText = `${companyName}%0A%0AContext:%0A${situationInput}%0A%0AProposal:%0A${recommendationOutput}%0A%0ASent%20on:%20${currentDate}`;
  var whatsappLink = `https://wa.me/?text=${shareText}`;
  window.open(whatsappLink, "_blank");
}








function handleYess() {
  // Implement your logic here
  alert("Opposition judgment are in progress");
}


function handleNoo() {
  // Open a modal pop-up for print and share options
  $("#printtShareModal").modal("show");

  // Show the Print button when "No" is clicked
  document.getElementById("printtButton").style.display = "inline-block";

  document.getElementById("shareeButton").style.display = "inline-block";
}

// Function to print selected rows along with situationInput and recommendationOutput
function printPDFF() {
  var situationInput = document.getElementById("situationInput").value;
  var recommendationOutput = document.getElementById("recommendationOutput").innerText;
  var printWindow = window.open("", "_blank");

  // Add content to the new window with improved styling
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Printed Content (PDF)</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                position: relative; /* Set position relative to enable absolute positioning of watermark */
                
            }
            h3 {
                color: #333;
                font-size: 22px; /* Adjust font size */
            }
            p {
                white-space: pre-wrap;
                font-size: 20px; /* Adjust font size */
            }
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 16px; /* Adjust font size */
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .summary {
              font-size: 18px; /* Adjust font size for summary */
          }
        </style>
    </head>
    <body>
        <div class="watermark">LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.</div> <!-- Add watermark text -->
        <h3>Context:</h3>
        <p>${situationInput}</p>
        <h3>Proposal:</h3>
        <p>${recommendationOutput}</p>
        <h3>Similar Judgment:</h3>
        <table>
            <thead>
                <tr>
                    <th>CASE NO.</th>
                    <th>PETITIONER</th>
                    <th>RESPONDENT</th>
                    <th>DATE</th>
                    <th>JUDGE</th>
                    <th>PREDICTION</th>
                    <th>SUMMARY</th>
                    <th>URL</th>
                    <th>CHECKBOX</th>
                </tr>
            </thead>
            <tbody>
                ${getSelectedRowsHTML()} <!-- Get HTML content of selected rows -->
            </tbody>
        </table>
    </body>
    </html>
  `);
  // Close the document stream
  printWindow.document.close();
  // Trigger the print dialog
  printWindow.print();
}

// Function to get HTML content of selected rows including the summary
function getSelectedRowsHTML() {
  var selectedRowsHTML = "";
  var table = document.getElementById("dataTable");
  var rows = table.getElementsByTagName("tr");
  for (var i = 0; i < rows.length; i++) {
    var checkbox = rows[i].querySelector(".rowCheckbox");
    if (checkbox && checkbox.checked) {
      // Get summary content for the selected row
      var summary = rows[i].querySelector(".detailed-summary").innerHTML;
      selectedRowsHTML += `<tr>${rows[i].innerHTML}</tr><tr><td colspan='9'><h3>Summary</h3>${summary}</td></tr>`;
    }
  }
  return selectedRowsHTML;
}



// Function to print selected rows along with situationInput and recommendationOutput in DOC format
function printDOCC() {
  var situationInput = document.getElementById("situationInput").value;
  var recommendationOutput = document.getElementById("recommendationOutput").innerText;

  // Get selected rows HTML content
  var selectedRowsHTML = getSelectedRowsHTML();

  // Create content with consistent styling
  var content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Printed Content (DOC)</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
               
            }
            h3 {
                color: #333;
                font-size: 22px; /* Adjust font size */
            }
            p {
                white-space: pre-wrap;
                font-size: 20px; /* Adjust font size */
            }
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 16px; /* Adjust font size */
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .summary {
                font-size: 20px; /* Adjust font size for summary */
            }
        </style>
    </head>
    <body>
        <div class="watermark">LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.</div> <!-- Add watermark text -->
        <h3>Context:</h3>
        <p>${situationInput}</p>
        <h3>Proposal:</h3>
        <p>${recommendationOutput}</p>
        <h3>Selected Rows:</h3>
        <table>
            <thead>
                <tr>
                    <th>CASE NO.</th>
                    <th>PETITIONER</th>
                    <th>RESPONDENT</th>
                    <th>DATE</th>
                    <th>JUDGE</th>
                    <th>PREDICTION</th>
                    <th>SUMMARY</th>
                    <th>URL</th>
                    <th>CHECKBOX</th>
                </tr>
            </thead>
            <tbody>
                ${selectedRowsHTML} <!-- Insert selected rows HTML content -->
            </tbody>
        </table>
    </body>
    </html>
  `;

  // Create a new Blob object containing the content
  var blob = new Blob([content], { type: "application/msword" });

  // Create a temporary anchor element
  var anchor = document.createElement("a");
  anchor.href = window.URL.createObjectURL(blob);

  // Set the file name
  anchor.download = "document.doc";

  // Programmatically click the anchor to trigger the download
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(anchor.href);
}


function handlePrinttButton() {
  var printtOptions = document.getElementById("printtOptions");
  var shareeOptions = document.getElementById("shareeOptions");

  // Toggle the visibility of print options
  if (
    printtOptions.style.display === "none" ||
    printtOptions.style.display === ""
  ) {
    printtOptions.style.display = "block";
    shareeOptions.style.display = "none";
  } else {
    printtOptions.style.display = "none";
  }
}

// Function to toggle the visibility of share options
function toggleShareeOptions() {
  var printtOptions = document.getElementById("printtOptions");
  var shareeOptions = document.getElementById("shareeOptions");

  // Toggle the visibility of share options
  if (shareeOptions.style.display === "none") {
    shareeOptions.style.display = "block";
    printtOptions.style.display = "none";
  } else {
    shareeOptions.style.display = "none";
  }
}

// Function to share via Gmail including selected rows and summary
function shareViaGmaill() {
  var companyName = "LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.";
  var situationInput = encodeURIComponent(
    document.getElementById("situationInput").value
  );
  var recommendationOutput = encodeURIComponent(
    document.getElementById("recommendationOutput").innerText
  );
  var selectedRowsHTML = getSelecteddRowsHTML(); // Get selected rows HTML content
  var currentDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  }); // Get current date and time in Indian time zone

  // Construct the email body with context, proposal, and selected rows
  var mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${companyName}&body=Context:%0A${situationInput}%0A%0AProposal:%0A${recommendationOutput}%0A%0ASelected Rows:%0A${selectedRowsHTML}%0A%0ASent%20on:%20${currentDate}`;

  // Open the mailto link in a new tab
  window.open(mailtoLink, "_blank");
}


// Function to get plain text content of selected rows including the summary
function getSelecteddRowsHTML() {
 var selectedRowsPlainText = "Selected Rows:\n\n";

  // Get the table and its rows
  var table = document.getElementById("dataTable");
  var rows = table.getElementsByTagName("tr");

  // Get table headers
  var headers = table.querySelectorAll("th");
  var headerRowData = [];
  for (var i = 0; i < headers.length; i++) {
    headerRowData.push(headers[i].innerText.trim());
  }
  selectedRowsPlainText += headerRowData.join('\t') + '\n';

  // Iterate over each row
  for (var i = 0; i < rows.length; i++) {
    var checkbox = rows[i].querySelector(".rowCheckbox");
    if (checkbox && checkbox.checked) {
      // Get the cells of the row
      var cells = rows[i].querySelectorAll("td");

      // Extract text content from each cell
      var rowData = [];
      for (var j = 0; j < cells.length - 1; j++) { // Exclude the last cell with checkbox
        rowData.push(cells[j].innerText.trim());
      }

      // Add the row data to the plain text content
      selectedRowsPlainText += rowData.join('\t') + '\n';
    }
  }

  // Add a separator before the summaries
  selectedRowsPlainText += "\nSummaries:\n";

  // Iterate over each row again to get summaries
  for (var i = 0; i < rows.length; i++) {
    var checkbox = rows[i].querySelector(".rowCheckbox");
    if (checkbox && checkbox.checked) {
      var summary = rows[i].querySelector(".detailed-summary");
      if (summary) {
        selectedRowsPlainText += summary.innerText.trim() + '\n';
      }
    }
  }

  return selectedRowsPlainText;
}




function shareViaWhatsAppp() {
  var companyName = "LEX RES DATA SCIENCE AND ANALYTICS PVT.LTD.";
  var situationInput = encodeURIComponent(
    document.getElementById("situationInput").value
  );
  var recommendationOutput = encodeURIComponent(
    document.getElementById("recommendationOutput").innerText
  );
  var currentDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  }); // Get current date and time in Indian time zone
  var shareText = `${companyName}%0A%0AContext:%0A${situationInput}%0A%0AProposal:%0A${recommendationOutput}%0A%0ASent%20on:%20${currentDate}`;
  var whatsappLink = `https://wa.me/?text=${shareText}`;
  window.open(whatsappLink, "_blank");
}



function openNav() {
  // Check if the screen width is less than or equal to 768px (small screen)
  if (window.innerWidth <= 768) {
    document.getElementById("mySidebar").style.width = "270px";
    document.getElementById("mySidebar").style.zIndex = "1100"; // Ensure sidebar is above main content
    document.getElementById("main-content").style.marginLeft = "0px";
    document.getElementById("main-content").style.zIndex = "1000"; // Lower z-index to be below sidebar
  } else {
    // For larger screens, set the sidebar width to 250px and main content margin-left to 250px
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("mySidebar").style.zIndex = "1100"; // Ensure sidebar is above main content
    document.getElementById("main-content").style.marginLeft = "250px";
    document.getElementById("main-content").style.zIndex = "1000"; // Lower z-index to be below sidebar
  }
}





function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main-content").style.marginLeft = "0";
}

// Get the textarea element and the submit button
var situationInput = document.getElementById("situationInput");
var submitBtn = document.querySelector(".submit-btn");
var newChatBtn = document.querySelector(".right"); // assuming 'New Chat' is targeted by '.right' class

// Function to remove 'active' class from submit button
function resetSubmitButtonColor() {
  submitBtn.classList.remove("active");
}

// Add event listener for input events (typing)
situationInput.addEventListener("input", function () {
  // Check if there's text in the textarea
  if (situationInput.value.trim() !== "") {
    // Add a class to the submit button to change its color
    submitBtn.classList.add("active");
  } else {
    // If no text in the textarea, remove the class to revert back to default color
    resetSubmitButtonColor();
  }
});

// Add event listener for submit button click
submitBtn.addEventListener("click", resetSubmitButtonColor);

// Add event listener for "New Chat" button click
newChatBtn.addEventListener("click", resetSubmitButtonColor);



// Add this JavaScript function to handle scrolling to the top
function scrollToTop() {
  var mainContent = document.getElementById("main-content");
  mainContent.scrollTop = 0;
}

// Add this JavaScript function to show/hide the scroll to top button based on scroll position
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("scrollToTopButton").style.display = "block";
  } else {
      document.getElementById("scrollToTopButton").style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to toggle theme
  function toggleTheme() {
      // Toggle between dark and light themes
      document.body.classList.toggle("dark-theme");
      document.body.classList.toggle("light-theme");

      // Toggle inline styles for the body
      var bodyInlineStyles = document.body.getAttribute("style");
      if (bodyInlineStyles) {
          // Replace inline styles based on the current theme
          var newInlineStyles = bodyInlineStyles
              .replace(/color:\s*[^;]+;/g, '')  // Remove color property
              .replace(/background-color:\s*[^;]+;/g, ''); // Remove background-color property

          if (document.body.classList.contains("dark-theme")) {
              // Apply dark theme styles
              newInlineStyles += "color: #fff; background-color: #333;";
          } else {
              // Apply light theme styles
              newInlineStyles += "color: #000; background-color: #fff;";
          }

          // Set the updated inline styles
          document.body.setAttribute("style", newInlineStyles);
      }
  }

  // Add event listener for theme toggle button
  var themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Apply preferred theme from localStorage on page load
  var preferredTheme = localStorage.getItem("theme");
  if (preferredTheme === "dark") {
      document.body.classList.add("dark-theme");
  } else {
      document.body.classList.add("light-theme");
  }
});





function showAllColumns() {
  var table = document.getElementById("dataTable");
  for (var i = 0; i < table.rows.length; i++) {
      for (var j = 0; j < table.rows[i].cells.length; j++) {
          table.rows[i].cells[j].style.display = "";
      }
  }
  document.getElementById("columnFilter").style.display = "none";
}

function toggleColumnFilter() {
  var filter = document.getElementById("columnFilter");
  if (filter.style.display === "none") {
      filter.style.display = "block";
  } else {
      filter.style.display = "none";
  }
}

document.querySelectorAll('.columnCheckbox').forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
      var selectedColumns = [];
      document.querySelectorAll('.columnCheckbox:checked').forEach(function(checked) {
          selectedColumns.push(parseInt(checked.value));
      });
      var table = document.getElementById("dataTable");
      for (var i = 0; i < table.rows.length; i++) {
          for (var j = 0; j < table.rows[i].cells.length; j++) {
              if (selectedColumns.includes(j + 1)) {
                  table.rows[i].cells[j].style.display = "";
              } else {
                  table.rows[i].cells[j].style.display = "none";
              }
          }
      }
  });
});

document.querySelectorAll('.rowCheckbox').forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
      // Handle row selection logic here
      console.log('Row checkbox clicked');
  });
});


 // jQuery.noConflict();
  //jQuery(document).ready(function($) {
      // Your jQuery code using $ here
 // });

  

 