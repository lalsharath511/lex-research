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
                row += "<td>" + item["respondent "] + "</td>"; // Note the space in the key name
                row += "<td>" + item.date + "</td>";
                row += "<td>" + item.judge + "</td>";
                row += "<td>" + item.prediction + "</td>";
                row += "<td>" + item.summary + "</td>";
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