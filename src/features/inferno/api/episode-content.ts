/** [DRAFT] Replace this adapter when a block-content API becomes available. */
import { buildEpisodeContent } from '@/src/features/inferno/api/mocks/episode-blocks';
import type { InfernoFinalMatchProfile } from '@/src/features/inferno/types';
import { resolveChoice } from '@/src/features/inferno/utils/resolve-choice';
import type {
  ChoicePoint,
  EpisodeContent,
  SceneSeasonState,
} from '@/src/features/inferno/types/scene-block';
export async function getEpisodeContent(
  order: number,
  state: SceneSeasonState,
  mine?: InfernoFinalMatchProfile,
): Promise<EpisodeContent> {
  const content = buildEpisodeContent(order, state);
  return {
    ...content,
    blocks: content.blocks.map((block) =>
      'participants' in block && mine
        ? {
            ...block,
            participants: block.participants.map((person) =>
              person.isMine ? { ...person, ...mine } : person,
            ),
          }
        : block,
    ),
  };
}
/** [DRAFT] Replace with choice submission; deterministic rules remain outside React. */
export async function submitEpisodeChoice(
  state: SceneSeasonState,
  pointId: ChoicePoint,
  order: number,
  breadId: string | null,
) {
  return resolveChoice(
    state,
    pointId,
    order,
    breadId,
    process.env.EXPO_PUBLIC_MOCK_SCENARIO ?? 'default',
  );
}
