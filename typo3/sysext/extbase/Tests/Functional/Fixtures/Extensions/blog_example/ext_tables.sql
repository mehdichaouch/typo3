#
# Table structure for table 'tx_blogexample_domain_model_blog'
#
CREATE TABLE tx_blogexample_domain_model_blog (
	title varchar(255) DEFAULT '' NOT NULL,
	subtitle varchar(255) DEFAULT '',
	administrator int(11) DEFAULT '0' NOT NULL,

	posts varchar(255) DEFAULT '' NOT NULL
);

#
# Table structure for table 'tx_blogexample_domain_model_post'
#
CREATE TABLE tx_blogexample_domain_model_post (
	blog int(11) DEFAULT '0' NOT NULL,

	title varchar(255) DEFAULT '' NOT NULL,
	author int(11) DEFAULT '0' NOT NULL,
	reviewer int(11) DEFAULT '0' NOT NULL,
	tags int(11) unsigned DEFAULT '0' NOT NULL,
	comments int(11) unsigned DEFAULT '0' NOT NULL,
	related_posts int(11) unsigned DEFAULT '0' NOT NULL,
	additional_name varchar(255) DEFAULT '' NOT NULL,
	additional_info int(11) DEFAULT '0' NOT NULL,
	additional_comments varchar(255) DEFAULT '' NOT NULL
);

#
# Table structure for table 'tx_blogexample_domain_model_comment'
#
CREATE TABLE tx_blogexample_domain_model_comment (
	post int(11) DEFAULT '0' NOT NULL,

	author varchar(255) DEFAULT '' NOT NULL,
);

#
# Table structure for table 'tx_blogexample_domain_model_person'
#
CREATE TABLE tx_blogexample_domain_model_person (
	firstname varchar(255) DEFAULT '' NOT NULL,
	lastname varchar(255) DEFAULT '' NOT NULL,
	salutation varchar(4) DEFAULT '' NOT NULL,
	tags int(11) unsigned DEFAULT '0' NOT NULL,
	tags_special int(11) unsigned DEFAULT '0' NOT NULL
);

#
# Table structure for table 'tx_blogexample_domain_model_tag'
#
CREATE TABLE tx_blogexample_domain_model_tag (
	name varchar(255) DEFAULT '' NOT NULL,
);

#
# Table structure for table 'tx_blogexample_domain_model_dateexample'
# @deprectaed Can be removed as soon as int / native type is enforced
#
CREATE TABLE tx_blogexample_domain_model_dateexample (
	datetime_text varchar(255) DEFAULT '' NOT NULL,
);

#
# Table structure for table 'tx_blogexample_domain_model_info'
#
CREATE TABLE tx_blogexample_domain_model_info (
	name varchar(255) DEFAULT '' NOT NULL,
	post int(11) DEFAULT '0' NOT NULL
);

#
# Table structure for table 'tx_blogexample_domain_model_datetimeimmutableexample'
# @deprectaed Can be removed as soon as int / native type is enforced
#
CREATE TABLE tx_blogexample_domain_model_datetimeimmutableexample (
	datetime_immutable_text varchar(255) DEFAULT '' NOT NULL,
);
