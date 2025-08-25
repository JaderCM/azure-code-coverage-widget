# Privacy Policy — Code Coverage Widget Dev

Effective date: 2025-08-25  
Last updated: 2025-08-25

This Privacy Policy explains how the Code Coverage Widget Dev (“Extension”, “Widget”) handles information when used within Azure DevOps. By installing and using the Extension, you agree to these practices.

If you have questions, please use the support channels listed below.

## 1. Who we are
- Publisher: JaderCM (as listed on the Visual Studio Marketplace)
- Product: Code Coverage Widget Dev (Azure DevOps dashboard widget that displays code coverage charts)
- Data controller: For data processed locally by the Extension, the controller is the organization/user who installs it. Data hosted by Azure DevOps remains under Microsoft’s control.

## 2. What data the Extension accesses
The Extension operates inside Azure DevOps and uses read-only permissions to present coverage metrics:
- Access scopes: vso.build, vso.test (read access to builds, pipelines, coverage artifacts, and test results).
- Functional data accessed:
  - Project/team/pipeline identifiers and metadata (e.g., IDs and names)
  - Build runs and coverage artifacts (coverage summaries such as covered/not-covered lines)
  - Aggregated test metadata (e.g., statistics)
- Widget configuration data:
  - User-selected preferences (chosen pipeline IDs, widget options/sizes), stored as part of the dashboard configuration in Azure DevOps.

## 3. Personal data
- The Extension does not collect, store, or transmit personal data to the developer’s servers.
- Any user-related data visible in the Azure DevOps context (e.g., project/team names that may contain personal information) remains within Azure DevOps.
- No profiling or enrichment of personal data is performed.

## 4. Collection and transmission
- No proprietary backend: the Extension does not send data to the publisher’s servers.
- Data is read directly from Azure DevOps APIs solely to render information on the user’s dashboard.
- Access tokens/OAuth are provided and controlled by Azure DevOps; the Extension only uses them within the session context and does not persist them independently.

## 5. Cookies and local storage
- The Extension does not set its own cookies.
- It may rely on Azure DevOps platform mechanisms or browser-local cache to preserve widget preferences (when applicable).
- No locally stored information is shared with third parties by the widget.

## 6. Purpose of processing
- Display code coverage and testing metrics for selected pipelines on an Azure DevOps dashboard.
- Improve user experience via widget visualization settings.

## 7. Retention
- Widget settings remain associated with the dashboard while the widget is installed or until removed by the user/project admin.
- As there is no separate server, we do not retain external copies of Azure DevOps data.

## 8. Security
- The Extension uses Azure DevOps’ security model and the extension SDK for authenticated calls.
- Credentials are not stored outside the context provided by Azure DevOps.
- We recommend applying least-privilege access and managing project/pipeline permissions within your organization.

## 9. Third parties and sub-processors
- Microsoft Azure DevOps: provides authentication, APIs, and storage of project data.
- Visual Studio Marketplace: hosts the Extension’s static assets.
- The widget does not send data to other third parties.

## 10. International transfers
- Project data and coverage metrics reside and travel according to your Microsoft/Azure DevOps organization’s policies and selected regions.
- The Extension does not change data residency or create new transfers.

## 11. Legal basis and data subject rights (GDPR/LGPD)
- Legal basis: performance of a contract/legitimate interests to display technical metrics necessary for the widget to function within Azure DevOps.
- Rights: access, rectification, deletion, restriction, portability, and objection, as applicable.
- Requests: contact your Azure DevOps organization admin for data hosted by Microsoft. For Extension-related privacy inquiries, use the support channels below.

## 12. Children and minors
- The Extension is intended for corporate/technical use and is not directed at children/minors.

## 13. Uninstalling and deleting data
- Remove the widget from the dashboard to delete its local settings within Azure DevOps.
- To uninstall the Extension from your project/organization, use Azure DevOps’ Extensions management.
- Build/test data and coverage artifacts are part of your pipelines and remain under your control in Azure DevOps.

## 14. Changes to this policy
- We may update this policy to reflect product or legal changes.
- The current version and effective date are shown at the top of this document.

## 15. Support and contact
- Support (Q&A): https://marketplace.visualstudio.com/items?itemName=JaderCM.code-coverage-widget&ssr=false#qna
- Repository (issues): https://github.com/JaderCM/azure-code-coverage-widget/issues
