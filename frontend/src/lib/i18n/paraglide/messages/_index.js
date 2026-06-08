/* eslint-disable */
import { getLocale, experimentalStaticLocale } from "../runtime.js"

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */
/** @typedef {{}} Admin_Dashboard_Card_Accountability_DescriptionInputs */
/** @typedef {{}} Admin_Dashboard_Card_Accountability_TitleInputs */
/** @typedef {{}} Admin_Dashboard_Card_Api_DescriptionInputs */
/** @typedef {{}} Admin_Dashboard_Card_Api_TitleInputs */
/** @typedef {{}} Admin_Dashboard_Card_Content_DescriptionInputs */
/** @typedef {{}} Admin_Dashboard_Card_Content_TitleInputs */
/** @typedef {{}} Admin_Dashboard_Card_Publishing_DescriptionInputs */
/** @typedef {{}} Admin_Dashboard_Card_Publishing_TitleInputs */
/** @typedef {{}} Admin_Dashboard_SubtitleInputs */
/** @typedef {{}} Admin_Dashboard_TitleInputs */
/** @typedef {{}} Admin_Language_BgInputs */
/** @typedef {{}} Admin_Language_EnInputs */
/** @typedef {{}} Admin_Login_EmailInputs */
/** @typedef {{}} Admin_Login_Failed_TitleInputs */
/** @typedef {{}} Admin_Login_Invalid_EmailInputs */
/** @typedef {{}} Admin_Login_Missing_PasswordInputs */
/** @typedef {{}} Admin_Login_PasswordInputs */
/** @typedef {{}} Admin_Login_SubmitInputs */
/** @typedef {{}} Admin_Login_SubtitleInputs */
/** @typedef {{}} Admin_Login_TitleInputs */
/** @typedef {{}} Admin_Nav_ContentInputs */
/** @typedef {{}} Admin_Nav_DashboardInputs */
/** @typedef {{}} Admin_Nav_DocumentsInputs */
/** @typedef {{}} Admin_Nav_SettingsInputs */
/** @typedef {{}} Admin_Not_Found_BodyInputs */
/** @typedef {{}} Admin_Not_Found_DashboardInputs */
/** @typedef {{}} Admin_Not_Found_EyebrowInputs */
/** @typedef {{}} Admin_Not_Found_Public_SiteInputs */
/** @typedef {{}} Admin_Not_Found_TitleInputs */
/** @typedef {{}} Admin_Shell_Close_NavigationInputs */
/** @typedef {{}} Admin_Shell_Language_LabelInputs */
/** @typedef {{}} Admin_Shell_Navigation_LabelInputs */
/** @typedef {{}} Admin_Shell_Open_NavigationInputs */
/** @typedef {{}} Admin_Shell_Sign_OutInputs */
/** @typedef {{}} Admin_Shell_SubtitleInputs */
/** @typedef {{}} Admin_Shell_TitleInputs */
/** @typedef {{}} Admin_Shell_View_Public_SiteInputs */
/** @typedef {{}} Public_Nav_Access_TitleInputs */
/** @typedef {{}} Public_Nav_Action_Contact_HallInputs */
/** @typedef {{}} Public_Nav_Action_Report_ConcernInputs */
/** @typedef {{}} Public_Nav_Action_View_NoticesInputs */
/** @typedef {{}} Public_Nav_Alerts_DescriptionInputs */
/** @typedef {{}} Public_Nav_Alerts_LabelInputs */
/** @typedef {{}} Public_Nav_Business_LabelInputs */
/** @typedef {{}} Public_Nav_Calendar_DescriptionInputs */
/** @typedef {{}} Public_Nav_Calendar_LabelInputs */
/** @typedef {{}} Public_Nav_Callout_CtaInputs */
/** @typedef {{}} Public_Nav_Callout_DescriptionInputs */
/** @typedef {{}} Public_Nav_Callout_MetaInputs */
/** @typedef {{}} Public_Nav_Callout_TitleInputs */
/** @typedef {{}} Public_Nav_Community_TitleInputs */
/** @typedef {{}} Public_Nav_Contact_LabelInputs */
/** @typedef {{}} Public_Nav_Council_DescriptionInputs */
/** @typedef {{}} Public_Nav_Council_LabelInputs */
/** @typedef {{}} Public_Nav_Departments_LabelInputs */
/** @typedef {{}} Public_Nav_Government_LabelInputs */
/** @typedef {{}} Public_Nav_Home_LabelInputs */
/** @typedef {{}} Public_Nav_Legal_AccessibilityInputs */
/** @typedef {{}} Public_Nav_Legal_PrivacyInputs */
/** @typedef {{}} Public_Nav_Legal_Public_RecordsInputs */
/** @typedef {{}} Public_Nav_Meeting_Agendas_LabelInputs */
/** @typedef {{}} Public_Nav_Meetings_LabelInputs */
/** @typedef {{}} Public_Nav_Parks_DescriptionInputs */
/** @typedef {{}} Public_Nav_Parks_LabelInputs */
/** @typedef {{}} Public_Nav_Pay_Bill_LabelInputs */
/** @typedef {{}} Public_Nav_Permits_DescriptionInputs */
/** @typedef {{}} Public_Nav_Permits_Inspections_LabelInputs */
/** @typedef {{}} Public_Nav_Permits_LabelInputs */
/** @typedef {{}} Public_Nav_Public_Notices_DescriptionInputs */
/** @typedef {{}} Public_Nav_Public_Notices_LabelInputs */
/** @typedef {{}} Public_Nav_Report_Issue_LabelInputs */
/** @typedef {{}} Public_Nav_Residents_LabelInputs */
/** @typedef {{}} Public_Nav_Search_LabelInputs */
/** @typedef {{}} Public_Nav_Search_PlaceholderInputs */
/** @typedef {{}} Public_Nav_Services_TitleInputs */
/** @typedef {{}} Public_Nav_Trash_Collection_DescriptionInputs */
/** @typedef {{}} Public_Nav_Trash_Collection_LabelInputs */
/** @typedef {{}} Public_Nav_Water_Sewer_DescriptionInputs */
/** @typedef {{}} Public_Nav_Water_Sewer_LabelInputs */
/** @typedef {{}} Public_Not_Found_BodyInputs */
/** @typedef {{}} Public_Not_Found_EyebrowInputs */
/** @typedef {{}} Public_Not_Found_HomeInputs */
/** @typedef {{}} Public_Not_Found_SearchInputs */
/** @typedef {{}} Public_Not_Found_TitleInputs */
/** @typedef {{}} Public_Shell_Footer_Address_LabelInputs */
/** @typedef {{}} Public_Shell_Footer_Contact_AriaInputs */
/** @typedef {{}} Public_Shell_Footer_Copyright_PrefixInputs */
/** @typedef {{}} Public_Shell_Footer_Copyright_SuffixInputs */
/** @typedef {{}} Public_Shell_Footer_Email_LabelInputs */
/** @typedef {{}} Public_Shell_Footer_Hours_LabelInputs */
/** @typedef {{}} Public_Shell_Footer_Navigation_LabelInputs */
/** @typedef {{}} Public_Shell_Footer_Official_SummaryInputs */
/** @typedef {{}} Public_Shell_Footer_Phone_LabelInputs */
/** @typedef {{}} Public_Shell_Header_Close_NavigationInputs */
/** @typedef {{}} Public_Shell_Header_Main_MenuInputs */
/** @typedef {{}} Public_Shell_Header_Mobile_MenuInputs */
/** @typedef {{}} Public_Shell_Header_Open_NavigationInputs */
/** @typedef {{}} Public_Shell_Header_Utility_NavigationInputs */
/** @typedef {{}} Public_Shell_Main_LabelInputs */
/** @typedef {{}} Public_Site_Fallback_AddressInputs */
/** @typedef {{}} Public_Site_Fallback_Municipality_NameInputs */
/** @typedef {{}} Public_Site_Fallback_Office_HoursInputs */
/** @typedef {{}} Public_Site_Fallback_PhoneInputs */
/** @typedef {{}} Public_Site_Fallback_TaglineInputs */
import * as __en from "./en.js"
import * as __bg from "./bg.js"
/**
* | output |
* | --- |
* | "All future write flows should keep audit logs and admin-only access." |
*
* @param {Admin_Dashboard_Card_Accountability_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_accountability_description = /** @type {((inputs?: Admin_Dashboard_Card_Accountability_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Accountability_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_accountability_description(inputs)
	return __bg.admin_dashboard_card_accountability_description(inputs)
});
/**
* | output |
* | --- |
* | "Admin accountability" |
*
* @param {Admin_Dashboard_Card_Accountability_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_accountability_title = /** @type {((inputs?: Admin_Dashboard_Card_Accountability_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Accountability_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_accountability_title(inputs)
	return __bg.admin_dashboard_card_accountability_title(inputs)
});
/**
* | output |
* | --- |
* | "Admin screens use server-owned wrappers and never store tokens in the browser." |
*
* @param {Admin_Dashboard_Card_Api_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_api_description = /** @type {((inputs?: Admin_Dashboard_Card_Api_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Api_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_api_description(inputs)
	return __bg.admin_dashboard_card_api_description(inputs)
});
/**
* | output |
* | --- |
* | "API boundaries" |
*
* @param {Admin_Dashboard_Card_Api_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_api_title = /** @type {((inputs?: Admin_Dashboard_Card_Api_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Api_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_api_title(inputs)
	return __bg.admin_dashboard_card_api_title(inputs)
});
/**
* | output |
* | --- |
* | "Manage civic records through protected admin screens as they are added." |
*
* @param {Admin_Dashboard_Card_Content_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_content_description = /** @type {((inputs?: Admin_Dashboard_Card_Content_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Content_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_content_description(inputs)
	return __bg.admin_dashboard_card_content_description(inputs)
});
/**
* | output |
* | --- |
* | "Content operations" |
*
* @param {Admin_Dashboard_Card_Content_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_content_title = /** @type {((inputs?: Admin_Dashboard_Card_Content_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Content_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_content_title(inputs)
	return __bg.admin_dashboard_card_content_title(inputs)
});
/**
* | output |
* | --- |
* | "Public visitors only see active or published records from the backend." |
*
* @param {Admin_Dashboard_Card_Publishing_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_publishing_description = /** @type {((inputs?: Admin_Dashboard_Card_Publishing_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Publishing_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_publishing_description(inputs)
	return __bg.admin_dashboard_card_publishing_description(inputs)
});
/**
* | output |
* | --- |
* | "Publishing workflow" |
*
* @param {Admin_Dashboard_Card_Publishing_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_card_publishing_title = /** @type {((inputs?: Admin_Dashboard_Card_Publishing_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_Card_Publishing_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_card_publishing_title(inputs)
	return __bg.admin_dashboard_card_publishing_title(inputs)
});
/**
* | output |
* | --- |
* | "Protected foundation for future municipality content management." |
*
* @param {Admin_Dashboard_SubtitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_subtitle = /** @type {((inputs?: Admin_Dashboard_SubtitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_SubtitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_subtitle(inputs)
	return __bg.admin_dashboard_subtitle(inputs)
});
/**
* | output |
* | --- |
* | "Dashboard" |
*
* @param {Admin_Dashboard_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard_title = /** @type {((inputs?: Admin_Dashboard_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Dashboard_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_dashboard_title(inputs)
	return __bg.admin_dashboard_title(inputs)
});
/**
* | output |
* | --- |
* | "BG" |
*
* @param {Admin_Language_BgInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_language_bg = /** @type {((inputs?: Admin_Language_BgInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Language_BgInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_language_bg(inputs)
	return __bg.admin_language_bg(inputs)
});
/**
* | output |
* | --- |
* | "EN" |
*
* @param {Admin_Language_EnInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_language_en = /** @type {((inputs?: Admin_Language_EnInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Language_EnInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_language_en(inputs)
	return __bg.admin_language_en(inputs)
});
/**
* | output |
* | --- |
* | "Email" |
*
* @param {Admin_Login_EmailInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_email = /** @type {((inputs?: Admin_Login_EmailInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_EmailInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_email(inputs)
	return __bg.admin_login_email(inputs)
});
/**
* | output |
* | --- |
* | "Could not sign in" |
*
* @param {Admin_Login_Failed_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_failed_title = /** @type {((inputs?: Admin_Login_Failed_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_Failed_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_failed_title(inputs)
	return __bg.admin_login_failed_title(inputs)
});
/**
* | output |
* | --- |
* | "Enter a valid email." |
*
* @param {Admin_Login_Invalid_EmailInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_invalid_email = /** @type {((inputs?: Admin_Login_Invalid_EmailInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_Invalid_EmailInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_invalid_email(inputs)
	return __bg.admin_login_invalid_email(inputs)
});
/**
* | output |
* | --- |
* | "Enter your password." |
*
* @param {Admin_Login_Missing_PasswordInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_missing_password = /** @type {((inputs?: Admin_Login_Missing_PasswordInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_Missing_PasswordInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_missing_password(inputs)
	return __bg.admin_login_missing_password(inputs)
});
/**
* | output |
* | --- |
* | "Password" |
*
* @param {Admin_Login_PasswordInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_password = /** @type {((inputs?: Admin_Login_PasswordInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_PasswordInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_password(inputs)
	return __bg.admin_login_password(inputs)
});
/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Admin_Login_SubmitInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_submit = /** @type {((inputs?: Admin_Login_SubmitInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_SubmitInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_submit(inputs)
	return __bg.admin_login_submit(inputs)
});
/**
* | output |
* | --- |
* | "Use an active townhall administrator account." |
*
* @param {Admin_Login_SubtitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_subtitle = /** @type {((inputs?: Admin_Login_SubtitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_SubtitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_subtitle(inputs)
	return __bg.admin_login_subtitle(inputs)
});
/**
* | output |
* | --- |
* | "Admin sign in" |
*
* @param {Admin_Login_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_login_title = /** @type {((inputs?: Admin_Login_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Login_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_login_title(inputs)
	return __bg.admin_login_title(inputs)
});
/**
* | output |
* | --- |
* | "Content" |
*
* @param {Admin_Nav_ContentInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_nav_content = /** @type {((inputs?: Admin_Nav_ContentInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Nav_ContentInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_nav_content(inputs)
	return __bg.admin_nav_content(inputs)
});
/**
* | output |
* | --- |
* | "Dashboard" |
*
* @param {Admin_Nav_DashboardInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_nav_dashboard = /** @type {((inputs?: Admin_Nav_DashboardInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Nav_DashboardInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_nav_dashboard(inputs)
	return __bg.admin_nav_dashboard(inputs)
});
/**
* | output |
* | --- |
* | "Documents" |
*
* @param {Admin_Nav_DocumentsInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_nav_documents = /** @type {((inputs?: Admin_Nav_DocumentsInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Nav_DocumentsInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_nav_documents(inputs)
	return __bg.admin_nav_documents(inputs)
});
/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Admin_Nav_SettingsInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_nav_settings = /** @type {((inputs?: Admin_Nav_SettingsInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Nav_SettingsInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_nav_settings(inputs)
	return __bg.admin_nav_settings(inputs)
});
/**
* | output |
* | --- |
* | "The admin page you requested does not exist or has not been built yet. Use the dashboard navigation to continue managing townhall content." |
*
* @param {Admin_Not_Found_BodyInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_not_found_body = /** @type {((inputs?: Admin_Not_Found_BodyInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Not_Found_BodyInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_not_found_body(inputs)
	return __bg.admin_not_found_body(inputs)
});
/**
* | output |
* | --- |
* | "Go to dashboard" |
*
* @param {Admin_Not_Found_DashboardInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_not_found_dashboard = /** @type {((inputs?: Admin_Not_Found_DashboardInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Not_Found_DashboardInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_not_found_dashboard(inputs)
	return __bg.admin_not_found_dashboard(inputs)
});
/**
* | output |
* | --- |
* | "404" |
*
* @param {Admin_Not_Found_EyebrowInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_not_found_eyebrow = /** @type {((inputs?: Admin_Not_Found_EyebrowInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Not_Found_EyebrowInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_not_found_eyebrow(inputs)
	return __bg.admin_not_found_eyebrow(inputs)
});
/**
* | output |
* | --- |
* | "View public site" |
*
* @param {Admin_Not_Found_Public_SiteInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_not_found_public_site = /** @type {((inputs?: Admin_Not_Found_Public_SiteInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Not_Found_Public_SiteInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_not_found_public_site(inputs)
	return __bg.admin_not_found_public_site(inputs)
});
/**
* | output |
* | --- |
* | "Admin page not found" |
*
* @param {Admin_Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_not_found_title = /** @type {((inputs?: Admin_Not_Found_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Not_Found_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_not_found_title(inputs)
	return __bg.admin_not_found_title(inputs)
});
/**
* | output |
* | --- |
* | "Close admin navigation" |
*
* @param {Admin_Shell_Close_NavigationInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_close_navigation = /** @type {((inputs?: Admin_Shell_Close_NavigationInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_Close_NavigationInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_close_navigation(inputs)
	return __bg.admin_shell_close_navigation(inputs)
});
/**
* | output |
* | --- |
* | "Admin language" |
*
* @param {Admin_Shell_Language_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_language_label = /** @type {((inputs?: Admin_Shell_Language_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_Language_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_language_label(inputs)
	return __bg.admin_shell_language_label(inputs)
});
/**
* | output |
* | --- |
* | "Admin navigation" |
*
* @param {Admin_Shell_Navigation_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_navigation_label = /** @type {((inputs?: Admin_Shell_Navigation_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_Navigation_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_navigation_label(inputs)
	return __bg.admin_shell_navigation_label(inputs)
});
/**
* | output |
* | --- |
* | "Open admin navigation" |
*
* @param {Admin_Shell_Open_NavigationInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_open_navigation = /** @type {((inputs?: Admin_Shell_Open_NavigationInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_Open_NavigationInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_open_navigation(inputs)
	return __bg.admin_shell_open_navigation(inputs)
});
/**
* | output |
* | --- |
* | "Sign out" |
*
* @param {Admin_Shell_Sign_OutInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_sign_out = /** @type {((inputs?: Admin_Shell_Sign_OutInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_Sign_OutInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_sign_out(inputs)
	return __bg.admin_shell_sign_out(inputs)
});
/**
* | output |
* | --- |
* | "Protected management console" |
*
* @param {Admin_Shell_SubtitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_subtitle = /** @type {((inputs?: Admin_Shell_SubtitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_SubtitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_subtitle(inputs)
	return __bg.admin_shell_subtitle(inputs)
});
/**
* | output |
* | --- |
* | "Townhall Admin" |
*
* @param {Admin_Shell_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_title = /** @type {((inputs?: Admin_Shell_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_title(inputs)
	return __bg.admin_shell_title(inputs)
});
/**
* | output |
* | --- |
* | "View public site" |
*
* @param {Admin_Shell_View_Public_SiteInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const admin_shell_view_public_site = /** @type {((inputs?: Admin_Shell_View_Public_SiteInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Shell_View_Public_SiteInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.admin_shell_view_public_site(inputs)
	return __bg.admin_shell_view_public_site(inputs)
});
/**
* | output |
* | --- |
* | "Access" |
*
* @param {Public_Nav_Access_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_access_title = /** @type {((inputs?: Public_Nav_Access_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Access_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_access_title(inputs)
	return __bg.public_nav_access_title(inputs)
});
/**
* | output |
* | --- |
* | "Contact hall" |
*
* @param {Public_Nav_Action_Contact_HallInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_action_contact_hall = /** @type {((inputs?: Public_Nav_Action_Contact_HallInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Action_Contact_HallInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_action_contact_hall(inputs)
	return __bg.public_nav_action_contact_hall(inputs)
});
/**
* | output |
* | --- |
* | "Report concern" |
*
* @param {Public_Nav_Action_Report_ConcernInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_action_report_concern = /** @type {((inputs?: Public_Nav_Action_Report_ConcernInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Action_Report_ConcernInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_action_report_concern(inputs)
	return __bg.public_nav_action_report_concern(inputs)
});
/**
* | output |
* | --- |
* | "View notices" |
*
* @param {Public_Nav_Action_View_NoticesInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_action_view_notices = /** @type {((inputs?: Public_Nav_Action_View_NoticesInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Action_View_NoticesInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_action_view_notices(inputs)
	return __bg.public_nav_action_view_notices(inputs)
});
/**
* | output |
* | --- |
* | "Emergency and important public banners." |
*
* @param {Public_Nav_Alerts_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_alerts_description = /** @type {((inputs?: Public_Nav_Alerts_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Alerts_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_alerts_description(inputs)
	return __bg.public_nav_alerts_description(inputs)
});
/**
* | output |
* | --- |
* | "Alerts" |
*
* @param {Public_Nav_Alerts_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_alerts_label = /** @type {((inputs?: Public_Nav_Alerts_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Alerts_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_alerts_label(inputs)
	return __bg.public_nav_alerts_label(inputs)
});
/**
* | output |
* | --- |
* | "Business" |
*
* @param {Public_Nav_Business_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_business_label = /** @type {((inputs?: Public_Nav_Business_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Business_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_business_label(inputs)
	return __bg.public_nav_business_label(inputs)
});
/**
* | output |
* | --- |
* | "Public events, meetings, and civic dates." |
*
* @param {Public_Nav_Calendar_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_calendar_description = /** @type {((inputs?: Public_Nav_Calendar_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Calendar_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_calendar_description(inputs)
	return __bg.public_nav_calendar_description(inputs)
});
/**
* | output |
* | --- |
* | "Calendar" |
*
* @param {Public_Nav_Calendar_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_calendar_label = /** @type {((inputs?: Public_Nav_Calendar_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Calendar_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_calendar_label(inputs)
	return __bg.public_nav_calendar_label(inputs)
});
/**
* | output |
* | --- |
* | "View agenda" |
*
* @param {Public_Nav_Callout_CtaInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_callout_cta = /** @type {((inputs?: Public_Nav_Callout_CtaInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Callout_CtaInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_callout_cta(inputs)
	return __bg.public_nav_callout_cta(inputs)
});
/**
* | output |
* | --- |
* | "Review upcoming council agenda items and published meeting materials." |
*
* @param {Public_Nav_Callout_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_callout_description = /** @type {((inputs?: Public_Nav_Callout_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Callout_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_callout_description(inputs)
	return __bg.public_nav_callout_description(inputs)
});
/**
* | output |
* | --- |
* | "Agenda posted" |
*
* @param {Public_Nav_Callout_MetaInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_callout_meta = /** @type {((inputs?: Public_Nav_Callout_MetaInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Callout_MetaInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_callout_meta(inputs)
	return __bg.public_nav_callout_meta(inputs)
});
/**
* | output |
* | --- |
* | "Next public meeting" |
*
* @param {Public_Nav_Callout_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_callout_title = /** @type {((inputs?: Public_Nav_Callout_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Callout_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_callout_title(inputs)
	return __bg.public_nav_callout_title(inputs)
});
/**
* | output |
* | --- |
* | "Community" |
*
* @param {Public_Nav_Community_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_community_title = /** @type {((inputs?: Public_Nav_Community_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Community_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_community_title(inputs)
	return __bg.public_nav_community_title(inputs)
});
/**
* | output |
* | --- |
* | "Contact" |
*
* @param {Public_Nav_Contact_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_contact_label = /** @type {((inputs?: Public_Nav_Contact_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Contact_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_contact_label(inputs)
	return __bg.public_nav_contact_label(inputs)
});
/**
* | output |
* | --- |
* | "Officials, committees, and council information." |
*
* @param {Public_Nav_Council_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_council_description = /** @type {((inputs?: Public_Nav_Council_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Council_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_council_description(inputs)
	return __bg.public_nav_council_description(inputs)
});
/**
* | output |
* | --- |
* | "Council" |
*
* @param {Public_Nav_Council_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_council_label = /** @type {((inputs?: Public_Nav_Council_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Council_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_council_label(inputs)
	return __bg.public_nav_council_label(inputs)
});
/**
* | output |
* | --- |
* | "Departments" |
*
* @param {Public_Nav_Departments_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_departments_label = /** @type {((inputs?: Public_Nav_Departments_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Departments_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_departments_label(inputs)
	return __bg.public_nav_departments_label(inputs)
});
/**
* | output |
* | --- |
* | "Government" |
*
* @param {Public_Nav_Government_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_government_label = /** @type {((inputs?: Public_Nav_Government_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Government_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_government_label(inputs)
	return __bg.public_nav_government_label(inputs)
});
/**
* | output |
* | --- |
* | "Home" |
*
* @param {Public_Nav_Home_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_home_label = /** @type {((inputs?: Public_Nav_Home_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Home_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_home_label(inputs)
	return __bg.public_nav_home_label(inputs)
});
/**
* | output |
* | --- |
* | "Accessibility" |
*
* @param {Public_Nav_Legal_AccessibilityInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_legal_accessibility = /** @type {((inputs?: Public_Nav_Legal_AccessibilityInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Legal_AccessibilityInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_legal_accessibility(inputs)
	return __bg.public_nav_legal_accessibility(inputs)
});
/**
* | output |
* | --- |
* | "Privacy" |
*
* @param {Public_Nav_Legal_PrivacyInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_legal_privacy = /** @type {((inputs?: Public_Nav_Legal_PrivacyInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Legal_PrivacyInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_legal_privacy(inputs)
	return __bg.public_nav_legal_privacy(inputs)
});
/**
* | output |
* | --- |
* | "Public records" |
*
* @param {Public_Nav_Legal_Public_RecordsInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_legal_public_records = /** @type {((inputs?: Public_Nav_Legal_Public_RecordsInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Legal_Public_RecordsInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_legal_public_records(inputs)
	return __bg.public_nav_legal_public_records(inputs)
});
/**
* | output |
* | --- |
* | "Meeting agendas" |
*
* @param {Public_Nav_Meeting_Agendas_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_meeting_agendas_label = /** @type {((inputs?: Public_Nav_Meeting_Agendas_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Meeting_Agendas_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_meeting_agendas_label(inputs)
	return __bg.public_nav_meeting_agendas_label(inputs)
});
/**
* | output |
* | --- |
* | "Meetings" |
*
* @param {Public_Nav_Meetings_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_meetings_label = /** @type {((inputs?: Public_Nav_Meetings_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Meetings_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_meetings_label(inputs)
	return __bg.public_nav_meetings_label(inputs)
});
/**
* | output |
* | --- |
* | "Facilities, reservations, and public spaces." |
*
* @param {Public_Nav_Parks_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_parks_description = /** @type {((inputs?: Public_Nav_Parks_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Parks_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_parks_description(inputs)
	return __bg.public_nav_parks_description(inputs)
});
/**
* | output |
* | --- |
* | "Parks" |
*
* @param {Public_Nav_Parks_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_parks_label = /** @type {((inputs?: Public_Nav_Parks_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Parks_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_parks_label(inputs)
	return __bg.public_nav_parks_label(inputs)
});
/**
* | output |
* | --- |
* | "Pay bill" |
*
* @param {Public_Nav_Pay_Bill_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_pay_bill_label = /** @type {((inputs?: Public_Nav_Pay_Bill_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Pay_Bill_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_pay_bill_label(inputs)
	return __bg.public_nav_pay_bill_label(inputs)
});
/**
* | output |
* | --- |
* | "Forms, requirements, and inspection information." |
*
* @param {Public_Nav_Permits_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_permits_description = /** @type {((inputs?: Public_Nav_Permits_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Permits_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_permits_description(inputs)
	return __bg.public_nav_permits_description(inputs)
});
/**
* | output |
* | --- |
* | "Permits and inspections" |
*
* @param {Public_Nav_Permits_Inspections_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_permits_inspections_label = /** @type {((inputs?: Public_Nav_Permits_Inspections_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Permits_Inspections_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_permits_inspections_label(inputs)
	return __bg.public_nav_permits_inspections_label(inputs)
});
/**
* | output |
* | --- |
* | "Permits" |
*
* @param {Public_Nav_Permits_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_permits_label = /** @type {((inputs?: Public_Nav_Permits_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Permits_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_permits_label(inputs)
	return __bg.public_nav_permits_label(inputs)
});
/**
* | output |
* | --- |
* | "Legal notices, hearings, and announcements." |
*
* @param {Public_Nav_Public_Notices_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_public_notices_description = /** @type {((inputs?: Public_Nav_Public_Notices_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Public_Notices_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_public_notices_description(inputs)
	return __bg.public_nav_public_notices_description(inputs)
});
/**
* | output |
* | --- |
* | "Public notices" |
*
* @param {Public_Nav_Public_Notices_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_public_notices_label = /** @type {((inputs?: Public_Nav_Public_Notices_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Public_Notices_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_public_notices_label(inputs)
	return __bg.public_nav_public_notices_label(inputs)
});
/**
* | output |
* | --- |
* | "Report issue" |
*
* @param {Public_Nav_Report_Issue_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_report_issue_label = /** @type {((inputs?: Public_Nav_Report_Issue_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Report_Issue_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_report_issue_label(inputs)
	return __bg.public_nav_report_issue_label(inputs)
});
/**
* | output |
* | --- |
* | "Residents" |
*
* @param {Public_Nav_Residents_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_residents_label = /** @type {((inputs?: Public_Nav_Residents_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Residents_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_residents_label(inputs)
	return __bg.public_nav_residents_label(inputs)
});
/**
* | output |
* | --- |
* | "Search" |
*
* @param {Public_Nav_Search_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_search_label = /** @type {((inputs?: Public_Nav_Search_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Search_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_search_label(inputs)
	return __bg.public_nav_search_label(inputs)
});
/**
* | output |
* | --- |
* | "Search public information" |
*
* @param {Public_Nav_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_search_placeholder = /** @type {((inputs?: Public_Nav_Search_PlaceholderInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Search_PlaceholderInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_search_placeholder(inputs)
	return __bg.public_nav_search_placeholder(inputs)
});
/**
* | output |
* | --- |
* | "Services" |
*
* @param {Public_Nav_Services_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_services_title = /** @type {((inputs?: Public_Nav_Services_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Services_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_services_title(inputs)
	return __bg.public_nav_services_title(inputs)
});
/**
* | output |
* | --- |
* | "Schedules, collection rules, and public updates." |
*
* @param {Public_Nav_Trash_Collection_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_trash_collection_description = /** @type {((inputs?: Public_Nav_Trash_Collection_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Trash_Collection_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_trash_collection_description(inputs)
	return __bg.public_nav_trash_collection_description(inputs)
});
/**
* | output |
* | --- |
* | "Trash collection" |
*
* @param {Public_Nav_Trash_Collection_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_trash_collection_label = /** @type {((inputs?: Public_Nav_Trash_Collection_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Trash_Collection_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_trash_collection_label(inputs)
	return __bg.public_nav_trash_collection_label(inputs)
});
/**
* | output |
* | --- |
* | "Billing, service requests, and utility notices." |
*
* @param {Public_Nav_Water_Sewer_DescriptionInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_water_sewer_description = /** @type {((inputs?: Public_Nav_Water_Sewer_DescriptionInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Water_Sewer_DescriptionInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_water_sewer_description(inputs)
	return __bg.public_nav_water_sewer_description(inputs)
});
/**
* | output |
* | --- |
* | "Water and sewer" |
*
* @param {Public_Nav_Water_Sewer_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_nav_water_sewer_label = /** @type {((inputs?: Public_Nav_Water_Sewer_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Nav_Water_Sewer_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_nav_water_sewer_label(inputs)
	return __bg.public_nav_water_sewer_label(inputs)
});
/**
* | output |
* | --- |
* | "The page you requested could not be found. Use the menu, search, or return to the public home page." |
*
* @param {Public_Not_Found_BodyInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_not_found_body = /** @type {((inputs?: Public_Not_Found_BodyInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Not_Found_BodyInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_not_found_body(inputs)
	return __bg.public_not_found_body(inputs)
});
/**
* | output |
* | --- |
* | "404" |
*
* @param {Public_Not_Found_EyebrowInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_not_found_eyebrow = /** @type {((inputs?: Public_Not_Found_EyebrowInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Not_Found_EyebrowInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_not_found_eyebrow(inputs)
	return __bg.public_not_found_eyebrow(inputs)
});
/**
* | output |
* | --- |
* | "Return home" |
*
* @param {Public_Not_Found_HomeInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_not_found_home = /** @type {((inputs?: Public_Not_Found_HomeInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Not_Found_HomeInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_not_found_home(inputs)
	return __bg.public_not_found_home(inputs)
});
/**
* | output |
* | --- |
* | "Search public information" |
*
* @param {Public_Not_Found_SearchInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_not_found_search = /** @type {((inputs?: Public_Not_Found_SearchInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Not_Found_SearchInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_not_found_search(inputs)
	return __bg.public_not_found_search(inputs)
});
/**
* | output |
* | --- |
* | "Page not found" |
*
* @param {Public_Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_not_found_title = /** @type {((inputs?: Public_Not_Found_TitleInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Not_Found_TitleInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_not_found_title(inputs)
	return __bg.public_not_found_title(inputs)
});
/**
* | output |
* | --- |
* | "Address" |
*
* @param {Public_Shell_Footer_Address_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_address_label = /** @type {((inputs?: Public_Shell_Footer_Address_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Address_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_address_label(inputs)
	return __bg.public_shell_footer_address_label(inputs)
});
/**
* | output |
* | --- |
* | "Municipality contact information" |
*
* @param {Public_Shell_Footer_Contact_AriaInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_contact_aria = /** @type {((inputs?: Public_Shell_Footer_Contact_AriaInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Contact_AriaInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_contact_aria(inputs)
	return __bg.public_shell_footer_contact_aria(inputs)
});
/**
* | output |
* | --- |
* | "Copyright 2026" |
*
* @param {Public_Shell_Footer_Copyright_PrefixInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_copyright_prefix = /** @type {((inputs?: Public_Shell_Footer_Copyright_PrefixInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Copyright_PrefixInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_copyright_prefix(inputs)
	return __bg.public_shell_footer_copyright_prefix(inputs)
});
/**
* | output |
* | --- |
* | "All rights reserved." |
*
* @param {Public_Shell_Footer_Copyright_SuffixInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_copyright_suffix = /** @type {((inputs?: Public_Shell_Footer_Copyright_SuffixInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Copyright_SuffixInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_copyright_suffix(inputs)
	return __bg.public_shell_footer_copyright_suffix(inputs)
});
/**
* | output |
* | --- |
* | "Email" |
*
* @param {Public_Shell_Footer_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_email_label = /** @type {((inputs?: Public_Shell_Footer_Email_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Email_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_email_label(inputs)
	return __bg.public_shell_footer_email_label(inputs)
});
/**
* | output |
* | --- |
* | "Hours" |
*
* @param {Public_Shell_Footer_Hours_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_hours_label = /** @type {((inputs?: Public_Shell_Footer_Hours_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Hours_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_hours_label(inputs)
	return __bg.public_shell_footer_hours_label(inputs)
});
/**
* | output |
* | --- |
* | "Footer navigation" |
*
* @param {Public_Shell_Footer_Navigation_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_navigation_label = /** @type {((inputs?: Public_Shell_Footer_Navigation_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Navigation_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_navigation_label(inputs)
	return __bg.public_shell_footer_navigation_label(inputs)
});
/**
* | output |
* | --- |
* | "Official municipal information and public services" |
*
* @param {Public_Shell_Footer_Official_SummaryInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_official_summary = /** @type {((inputs?: Public_Shell_Footer_Official_SummaryInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Official_SummaryInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_official_summary(inputs)
	return __bg.public_shell_footer_official_summary(inputs)
});
/**
* | output |
* | --- |
* | "Phone" |
*
* @param {Public_Shell_Footer_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_footer_phone_label = /** @type {((inputs?: Public_Shell_Footer_Phone_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Footer_Phone_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_footer_phone_label(inputs)
	return __bg.public_shell_footer_phone_label(inputs)
});
/**
* | output |
* | --- |
* | "Close navigation" |
*
* @param {Public_Shell_Header_Close_NavigationInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_header_close_navigation = /** @type {((inputs?: Public_Shell_Header_Close_NavigationInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Header_Close_NavigationInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_header_close_navigation(inputs)
	return __bg.public_shell_header_close_navigation(inputs)
});
/**
* | output |
* | --- |
* | "Main menu" |
*
* @param {Public_Shell_Header_Main_MenuInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_header_main_menu = /** @type {((inputs?: Public_Shell_Header_Main_MenuInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Header_Main_MenuInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_header_main_menu(inputs)
	return __bg.public_shell_header_main_menu(inputs)
});
/**
* | output |
* | --- |
* | "Mobile menu" |
*
* @param {Public_Shell_Header_Mobile_MenuInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_header_mobile_menu = /** @type {((inputs?: Public_Shell_Header_Mobile_MenuInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Header_Mobile_MenuInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_header_mobile_menu(inputs)
	return __bg.public_shell_header_mobile_menu(inputs)
});
/**
* | output |
* | --- |
* | "Open navigation" |
*
* @param {Public_Shell_Header_Open_NavigationInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_header_open_navigation = /** @type {((inputs?: Public_Shell_Header_Open_NavigationInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Header_Open_NavigationInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_header_open_navigation(inputs)
	return __bg.public_shell_header_open_navigation(inputs)
});
/**
* | output |
* | --- |
* | "Utility navigation" |
*
* @param {Public_Shell_Header_Utility_NavigationInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_header_utility_navigation = /** @type {((inputs?: Public_Shell_Header_Utility_NavigationInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Header_Utility_NavigationInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_header_utility_navigation(inputs)
	return __bg.public_shell_header_utility_navigation(inputs)
});
/**
* | output |
* | --- |
* | "Public page content" |
*
* @param {Public_Shell_Main_LabelInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_shell_main_label = /** @type {((inputs?: Public_Shell_Main_LabelInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Shell_Main_LabelInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_shell_main_label(inputs)
	return __bg.public_shell_main_label(inputs)
});
/**
* | output |
* | --- |
* | "24 Main Street, Millbrook" |
*
* @param {Public_Site_Fallback_AddressInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_site_fallback_address = /** @type {((inputs?: Public_Site_Fallback_AddressInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Site_Fallback_AddressInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_site_fallback_address(inputs)
	return __bg.public_site_fallback_address(inputs)
});
/**
* | output |
* | --- |
* | "Public website" |
*
* @param {Public_Site_Fallback_Municipality_NameInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_site_fallback_municipality_name = /** @type {((inputs?: Public_Site_Fallback_Municipality_NameInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Site_Fallback_Municipality_NameInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_site_fallback_municipality_name(inputs)
	return __bg.public_site_fallback_municipality_name(inputs)
});
/**
* | output |
* | --- |
* | "Mon-Fri, 8:30 AM-4:30 PM" |
*
* @param {Public_Site_Fallback_Office_HoursInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_site_fallback_office_hours = /** @type {((inputs?: Public_Site_Fallback_Office_HoursInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Site_Fallback_Office_HoursInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_site_fallback_office_hours(inputs)
	return __bg.public_site_fallback_office_hours(inputs)
});
/**
* | output |
* | --- |
* | "(555) 014-2800" |
*
* @param {Public_Site_Fallback_PhoneInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_site_fallback_phone = /** @type {((inputs?: Public_Site_Fallback_PhoneInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Site_Fallback_PhoneInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_site_fallback_phone(inputs)
	return __bg.public_site_fallback_phone(inputs)
});
/**
* | output |
* | --- |
* | "Municipality public services" |
*
* @param {Public_Site_Fallback_TaglineInputs} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {LocalizedString}
*/
export const public_site_fallback_tagline = /** @type {((inputs?: Public_Site_Fallback_TaglineInputs, options?: { locale?: "en" | "bg" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Public_Site_Fallback_TaglineInputs, { locale?: "en" | "bg" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.public_site_fallback_tagline(inputs)
	return __bg.public_site_fallback_tagline(inputs)
});