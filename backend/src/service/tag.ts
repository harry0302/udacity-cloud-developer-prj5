import { Tag } from "../models/tag";
import { TagRepository } from "../repository/tag";
import { createLogger } from "../utils/logger";

const logger = createLogger('TagsService');

const tagRepo = new TagRepository();

export async function getTags(): Promise<String[]> {
    logger.info("Retrieving all tags");
    const items = await tagRepo.findAll();

    return items.map(item => item.tagName);
}

export async function createTag(tag: Tag): Promise<void> {
    logger.info(`Creating tag ${tag.tagName}`);
    const exist = await tagRepo.existByName(tag.tagName);

    if (!exist) {
        await tagRepo.create(tag);
    }
}
