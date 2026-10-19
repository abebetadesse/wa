ALTER TABLE `literature_findings` ADD FULLTEXT INDEX `literature_findings_text_ft` (`title`, `abstract`) WITH PARSER ngram;--> statement-breakpoint
CREATE INDEX `literature_findings_strand_relevance_idx` ON `literature_findings` (`strand`(64), `relevance_score`);--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD `search_text` mediumtext GENERATED ALWAYS AS (CAST(`data` AS CHAR)) STORED;--> statement-breakpoint
ALTER TABLE `knowledge_items` ADD FULLTEXT INDEX `knowledge_items_search_ft` (`search_text`) WITH PARSER ngram;
