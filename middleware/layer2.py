import difflib
import re

def layer_2_mechanism(old_selector, last_success_dom, current_dom):
	for i, node in enumerate(last_success_dom):
		if node.get('xpath') == old_selector: #the old selector should be xpath instead of css selector
			target_node = node #target_node refers to that node that worked previously, now we need to find the closest match to this node using the find_heuristic_match
			target_index = i #target_node's index in the last_success_dom, this is required for breaking tie 
			break
	else:
		target_node = None
		target_index = None

	if target_node is None:
		return (None, 0.0)
	result = find_heuristic_match(current_dom, target_node, target_index)
	return result

def find_heuristic_match(current_dom, target_node, target_index):
	max_score = 0
	max_score_node_index = None #None instead of zero because what if no one scores any points, then i will end up returning xpath of the first node, which is incorrect
	target_xpath = target_node.get('xpath', '')

	for index, node in enumerate(current_dom):
		current_score = 0

		#category-1: tag matching (max score is 30)
		if node.get('tag') ==  target_node.get('tag'):
			current_score += 30


		#category-2: innerText matching and placeholder fallback (max score 40)
		if target_node.get('innerText'):
			innerText_node = node.get('innerText', '')
			innerText_target = target_node.get('innerText')
			ratio = difflib.SequenceMatcher(None, innerText_node, innerText_target).ratio()
			current_score += ratio*40
		else: #if no innerText we compare the placeholders
			placeholder_node = node.get('placeholder', '')
			placeholder_target = target_node.get('placeholder')

			if placeholder_target:
				ratio = difflib.SequenceMatcher(None, placeholder_node, placeholder_target).ratio()
				current_score += ratio*40

		#category-3: ariaLabel matching (max score 15)
		if target_node.get('ariaLabel'):
			ratio = difflib.SequenceMatcher(None, target_node.get('ariaLabel'), node.get('ariaLabel', '')).ratio()
			current_score += ratio*15

		#category-4: id/class matching (token matching) (max score 15)
		#part-1 id scoring:
		target_node_id_token = set(tokenize(target_node.get('id')))
		node_id_token = set(tokenize(node.get('id')))

		intersection_token_id = target_node_id_token & node_id_token

		classes_list_target = target_node.get('classes')
		classes_list_node = node.get('classes')

		target_node_class_token = set()
		node_class_token = set()

		if classes_list_target and classes_list_node:
			for c in classes_list_target:
				c_token = tokenize(c)
				target_node_class_token.update(c_token)

			for c in classes_list_node:
				c_token = tokenize(c)
				node_class_token.update(c_token)

		intersection_token_class = target_node_class_token & node_class_token
		tot_len = len(intersection_token_id) + len(intersection_token_class)
		pts = min(tot_len*5, 15)
		current_score += pts

		if current_score > max_score:
			max_score = current_score
			max_score_node_index = index

		#tie breaker logic: xpath + index proximity 
		elif current_score == max_score and current_score > 0:
			node_xpath = node.get('xpath', '')
			max_score_node_xpath = current_dom[max_score_node_index].get('xpath', '')

			node_sim = difflib.SequenceMatcher(None, node_xpath, target_xpath).ratio()
			max_score_node_sim = difflib.SequenceMatcher(None, max_score_node_xpath, target_xpath).ratio()

			#tie breaker-1:
			if node_sim > max_score_node_sim:
				max_score_node_index = index
			
			elif node_sim == max_score_node_sim:
				#tie breaker-2:
				node_distance = abs(target_index - index)
				max_score_node_distance = abs(target_index - max_score_node_index)

				if node_distance < max_score_node_distance:
					max_score_node_index = index

	if max_score_node_index is not None:
		return (current_dom[max_score_node_index].get('xpath'), max_score/100)
	else:
		return (None, 0.0)


def tokenize(text):
	if not text:
		return []
	# split on non-alphanumeric and camelCase boundaries
	tokens = re.split(r'(?<=[a-z])(?=[A-Z])|[^a-zA-Z0-9]+', text)

	# filter empty strings and lowercase everything
	result = []
	for t in tokens:
		if t:
			result.append(t.lower())
	return result

