// I stored the backend endpoint used by the frontend.
const API_URL = "/api/requirements";


// I stored the requirements currently loaded from the database.
let allRequirements = [];


// I stored the database ID of the requirement being edited.
let editingRequirementId = null;


// I selected the page elements I need to control.
const form = document.getElementById("requirement-form");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById(
    "cancel-edit-button"
);
const formMessage = document.getElementById("form-message");
const requirementsList = document.getElementById(
    "requirements-list"
);
const qualityPreview = document.getElementById(
    "quality-preview"
);
const searchInput = document.getElementById("search-input");
const levelFilter = document.getElementById("level-filter");
const statusFilter = document.getElementById("status-filter");
const exportButton = document.getElementById("export-button");


// I loaded all saved requirements from the backend.
async function loadRequirements() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load requirements.");
        }

        allRequirements = await response.json();

        updateDashboard();
        applyFilters();
    } catch (error) {
        requirementsList.innerHTML = `
            <div class="empty-state">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// I calculated requirement-quality findings using simple rules.
function checkRequirementQuality(requirement) {
    const findings = [];
    const statement = requirement.statement.trim();
    const lowerStatement = statement.toLowerCase();

    if (!lowerStatement.includes("shall")) {
        findings.push(
            'Missing "shall". Requirements should clearly state a mandatory obligation.'
        );
    }

    const vagueWords = [
        "fast",
        "easy",
        "efficient",
        "appropriate",
        "adequate",
        "sufficient",
        "user-friendly",
        "as needed",
        "where possible",
        "quickly",
    ];

    for (const vagueWord of vagueWords) {
        if (lowerStatement.includes(vagueWord)) {
            findings.push(
                `"${vagueWord}" may be vague or difficult to verify.`
            );
        }
    }

    if (
        !requirement.verification_method
        || requirement.verification_method.trim() === ""
    ) {
        findings.push(
            "Verification method is missing."
        );
    }

    if (statement.length < 25) {
        findings.push(
            "Requirement statement may be too short to be specific and testable."
        );
    }

    const andCount = (
        lowerStatement.match(/\sand\s/g) || []
    ).length;

    if (andCount >= 2) {
        findings.push(
            "The statement may contain multiple requirements joined together."
        );
    }

    if (
        requirement.level !== "Mission"
        && !requirement.parent_requirement_key
    ) {
        findings.push(
            "This lower-level requirement has no parent traceability link."
        );
    }

    return findings;
}


// I updated the dashboard summary values.
function updateDashboard() {
    const verifiedCount = allRequirements.filter(
        requirement =>
            requirement.verification_status === "Passed"
    ).length;

    const warningCount = allRequirements.reduce(
        (total, requirement) =>
            total + checkRequirementQuality(requirement).length,
        0
    );

    document.getElementById("total-count").textContent =
        allRequirements.length;

    document.getElementById("verified-count").textContent =
        verifiedCount;

    document.getElementById("pending-count").textContent =
        allRequirements.length - verifiedCount;

    document.getElementById("warning-count").textContent =
        warningCount;
}


// I filtered requirements using search, level, and status.
function applyFilters() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedLevel = levelFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredRequirements = allRequirements.filter(
        requirement => {
            const searchableText = `
                ${requirement.requirement_key}
                ${requirement.title}
                ${requirement.statement}
                ${requirement.owner}
                ${requirement.parent_requirement_key || ""}
            `.toLowerCase();

            const matchesSearch =
                searchableText.includes(searchTerm);

            const matchesLevel =
                selectedLevel === "All"
                || requirement.level === selectedLevel;

            const matchesStatus =
                selectedStatus === "All"
                || requirement.verification_status
                    === selectedStatus;

            return (
                matchesSearch
                && matchesLevel
                && matchesStatus
            );
        }
    );

    displayRequirements(filteredRequirements);
}


// I displayed requirement records as engineering cards.
function displayRequirements(requirements) {
    document.getElementById("visible-count").textContent =
        `${requirements.length} shown`;

    if (requirements.length === 0) {
        requirementsList.innerHTML = `
            <div class="empty-state">
                No requirements match the current filters.
            </div>
        `;

        return;
    }

    requirementsList.innerHTML = requirements
        .map(requirement => {
            const findings =
                checkRequirementQuality(requirement);

            const findingsHtml = findings.length > 0
                ? `
                    <div class="quality-findings">
                        ${findings.map(
                            finding => `
                                <div class="warning">
                                    ⚠ ${escapeHtml(finding)}
                                </div>
                            `
                        ).join("")}
                    </div>
                `
                : "";

            const statusClass =
                requirement.verification_status === "Passed"
                    ? "passed"
                    : requirement.verification_status === "Failed"
                        ? "failed"
                        : "pending";

            const parentBadge = requirement.parent_requirement_key
                ? `
                    <span class="badge">
                        Parent:
                        ${escapeHtml(
                            requirement.parent_requirement_key
                        )}
                    </span>
                `
                : `
                    <span class="badge">
                        Top-Level Requirement
                    </span>
                `;

            return `
                <article class="requirement-card">
                    <div class="requirement-card-header">
                        <div>
                            <p class="requirement-key">
                                ${escapeHtml(
                                    requirement.requirement_key
                                )}
                            </p>

                            <h3>
                                ${escapeHtml(requirement.title)}
                            </h3>
                        </div>

                        <div class="card-actions">
                            <button
                                type="button"
                                onclick="startEditing(${requirement.id})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="danger-button"
                                onclick="deleteRequirement(${requirement.id})"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <p class="requirement-statement">
                        ${escapeHtml(requirement.statement)}
                    </p>

                    <div class="metadata">
                        <span class="badge">
                            Level:
                            ${escapeHtml(requirement.level)}
                        </span>

                        <span class="badge">
                            Owner:
                            ${escapeHtml(requirement.owner)}
                        </span>

                        <span class="badge">
                            Method:
                            ${escapeHtml(
                                requirement.verification_method
                            )}
                        </span>

                        ${parentBadge}

                        <span class="badge ${statusClass}">
                            ${escapeHtml(
                                requirement.verification_status
                            )}
                        </span>
                    </div>

                    ${findingsHtml}
                </article>
            `;
        })
        .join("");
}


// I gathered the current form values into one object.
function getFormData() {
    return {
        requirement_key: document
            .getElementById("requirement-key")
            .value
            .trim(),

        title: document
            .getElementById("title")
            .value
            .trim(),

        statement: document
            .getElementById("statement")
            .value
            .trim(),

        level: document
            .getElementById("level")
            .value,

        owner: document
            .getElementById("owner")
            .value
            .trim(),

        parent_requirement_key: document
            .getElementById("parent-requirement-key")
            .value
            .trim() || null,

        verification_method: document
            .getElementById("verification-method")
            .value,

        verification_status: document
            .getElementById("verification-status")
            .value,

        rationale: document
            .getElementById("rationale")
            .value
            .trim() || null,
    };
}


// I created or updated a requirement when the form was submitted.
async function saveRequirement(event) {
    event.preventDefault();

    const requirementData = getFormData();

    const method = editingRequirementId
        ? "PATCH"
        : "POST";

    const url = editingRequirementId
        ? `${API_URL}/${editingRequirementId}`
        : API_URL;

    try {
        const response = await fetch(
            url,
            {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requirementData),
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.detail
                || "Could not save requirement."
            );
        }

        formMessage.textContent =
            editingRequirementId
                ? `${responseData.requirement_key} updated.`
                : `${responseData.requirement_key} created.`;

        resetForm();
        await loadRequirements();
    } catch (error) {
        formMessage.textContent = error.message;
    }
}


// I filled the form with an existing requirement for editing.
function startEditing(requirementId) {
    const requirement = allRequirements.find(
        item => item.id === requirementId
    );

    if (!requirement) {
        return;
    }

    editingRequirementId = requirementId;

    document.getElementById("requirement-key").value =
        requirement.requirement_key;

    document.getElementById("title").value =
        requirement.title;

    document.getElementById("statement").value =
        requirement.statement;

    document.getElementById("level").value =
        requirement.level;

    document.getElementById("owner").value =
        requirement.owner;

    document.getElementById("parent-requirement-key").value =
        requirement.parent_requirement_key || "";

    document.getElementById("verification-method").value =
        requirement.verification_method;

    document.getElementById("verification-status").value =
        requirement.verification_status;

    document.getElementById("rationale").value =
        requirement.rationale || "";

    formTitle.textContent = "Edit Requirement";
    submitButton.textContent = "Save Changes";
    cancelEditButton.classList.remove("hidden");

    updateQualityPreview();

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}


// I deleted a requirement after user confirmation.
async function deleteRequirement(requirementId) {
    const confirmed = window.confirm(
        "Permanently delete this requirement?"
    );

    if (!confirmed) {
        return;
    }

    const response = await fetch(
        `${API_URL}/${requirementId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        window.alert(
            "Could not delete the requirement."
        );

        return;
    }

    await loadRequirements();
}


// I returned the form to create mode.
function resetForm() {
    editingRequirementId = null;

    form.reset();

    formTitle.textContent = "Create Requirement";
    submitButton.textContent = "Create Requirement";
    cancelEditButton.classList.add("hidden");
    qualityPreview.classList.add("hidden");
}


// I displayed quality warnings before the requirement was saved.
function updateQualityPreview() {
    const requirementData = getFormData();

    if (!requirementData.statement) {
        qualityPreview.classList.add("hidden");
        return;
    }

    const findings = checkRequirementQuality(
        requirementData
    );

    if (findings.length === 0) {
        qualityPreview.classList.add("hidden");
        return;
    }

    qualityPreview.innerHTML = `
        <strong>Quality Review</strong>

        ${findings.map(
            finding => `
                <div>⚠ ${escapeHtml(finding)}</div>
            `
        ).join("")}
    `;

    qualityPreview.classList.remove("hidden");
}


// I exported the current requirement database as a CSV file.
function exportRequirementsToCsv() {
    const headers = [
        "Requirement ID",
        "Title",
        "Statement",
        "Level",
        "Owner",
        "Verification Method",
        "Verification Status",
        "Parent Requirement",
        "Rationale",
    ];

    const rows = allRequirements.map(requirement => [
        requirement.requirement_key,
        requirement.title,
        requirement.statement,
        requirement.level,
        requirement.owner,
        requirement.verification_method,
        requirement.verification_status,
        requirement.parent_requirement_key || "",
        requirement.rationale || "",
    ]);

    const csvRows = [headers, ...rows].map(row =>
        row.map(value => {
            const escapedValue = String(value)
                .replaceAll('"', '""');

            return `"${escapedValue}"`;
        }).join(",")
    );

    const csvContent = csvRows.join("\n");

    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;",
        }
    );

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "aurora-1-requirements.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
}


// I escaped user-entered text before displaying it in HTML.
function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
}


// I connected the page controls to their functions.
form.addEventListener("submit", saveRequirement);

cancelEditButton.addEventListener(
    "click",
    resetForm
);

searchInput.addEventListener(
    "input",
    applyFilters
);

levelFilter.addEventListener(
    "change",
    applyFilters
);

statusFilter.addEventListener(
    "change",
    applyFilters
);

document.getElementById("statement").addEventListener(
    "input",
    updateQualityPreview
);

document
    .getElementById("parent-requirement-key")
    .addEventListener(
        "input",
        updateQualityPreview
    );

exportButton.addEventListener(
    "click",
    exportRequirementsToCsv
);


// I loaded all stored requirements when the page opened.
loadRequirements();